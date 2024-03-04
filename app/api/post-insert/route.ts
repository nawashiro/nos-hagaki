"use server";

import { verifyEvent } from "nostr-tools";
import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";
import { getIp } from "@/src/getIp";
import { redis } from "@/src/redisUtil";
import { Ratelimit } from "@upstash/ratelimit";
import { verify } from "hcaptcha";
import { get } from "@vercel/edge-config";

const prisma = new PrismaClient();

const hCaptchasecret = process.env.HCAPTCHA_SECRET ?? "expect secret";

interface SignedObject {
  h_captcha_token: string;
  outbox: string[];
  insertId: string;
  event: {
    kind: number;
    content: string;
    pubkey: string;
    created_at: number;
    tags: string[][];
    sig: string;
    id: string;
  };
}

//レートリミット
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(6, "1 h"),
});

//バリデーション
const validation = (res: SignedObject, outbox: Set<string>) => {
  if (!verifyEvent(res.event)) throw new Error("不正なイベント");

  if (res.event.kind != 1) throw new Error("不正なkind");

  if (res.event.content.length > 1200)
    throw new Error("コンテンツが長すぎます");

  if (res.event.created_at * 1000 < new Date().getTime())
    throw new Error("過去が指定されています");

  if (
    res.event.tags.length != 1 ||
    res.event.tags[0].length != 2 ||
    res.event.tags[0][0] != "p"
  )
    throw new Error("不正なタグ");

  const createdAt = new Date(res.event.created_at * 1000);

  if (
    !(
      createdAt.getUTCHours() == 22 &&
      createdAt.getUTCMinutes() == 0 &&
      createdAt.getUTCSeconds() == 0 &&
      createdAt.getUTCMilliseconds() == 0
    )
  )
    throw new Error("時刻が不正です");

  const urlPattern = new RegExp(
    "^(wss?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name and extension
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator

  for (const value of outbox) {
    if (!urlPattern.test(value)) {
      throw Error("WebSocketサーバーurlが不正です");
    }
  }
};

//インサート
const dbInsert = async (res: SignedObject, ip: string, outbox: Set<string>) => {
  const sendDay = new Date(res.event.created_at * 1000);

  sendDay.setUTCHours(0);
  sendDay.setUTCMinutes(0);
  sendDay.setUTCSeconds(0);
  sendDay.setUTCMilliseconds(0);

  await prisma.submittedData.create({
    data: {
      sendDay: sendDay,
      relays: Array.from(outbox),
      event: {
        create: {
          kind: res.event.kind,
          content: res.event.content,
          pubkey: res.event.pubkey,
          created_at: res.event.created_at,
          address: res.event.tags[0][1],
          sig: res.event.sig,
          id: res.event.id,
        },
      },
      ip: ip,
    },
  });
};

//投函済みページ用データインサート
const submittedDataSet = async (res: SignedObject) => {
  const id = `event-${res.insertId}`;
  await redis.set(id, true);
  await redis.expire(id, 60 * 5);
};

export async function POST(req: NextRequest) {
  //メンテナンス
  if (process.env.NODE_ENV === "production") {
    if (await get("insertMaintenance")) {
      return new Response(null, { status: 503 });
    }
  }

  console.log("request");
  const ip = getIp(req);
  const res: SignedObject = await req.json();

  //hCaptcha
  try {
    const hCaptchaverify = await verify(hCaptchasecret, res.h_captcha_token);

    if (hCaptchaverify.success === true) {
    } else {
      return new Response(null, { status: 401 });
    }
  } catch (e) {
    console.info(e);
    return new Response(null, { status: 500 });
  }

  //レート制限
  const successIp = (await ratelimit.limit(ip)).success;
  if (!successIp) {
    return new Response(null, { status: 429 });
  }

  //推奨リレーリスト
  const outbox = new Set<string>(res.outbox);

  //バリデーション
  try {
    validation(res, outbox);
  } catch (e) {
    console.log(e);
    return new Response(null, { status: 422 });
  }

  //レート制限（公開鍵）
  const successPubkey = (await ratelimit.limit(res.event.pubkey)).success;
  if (!successPubkey) {
    return new Response(null, { status: 429 });
  }

  //インサート
  try {
    await dbInsert(res, ip, outbox);
    await submittedDataSet(res);
  } catch (e) {
    console.log(e);
    return new Response(null, { status: 500 });
  }

  return new Response(null, { status: 200 });
}
