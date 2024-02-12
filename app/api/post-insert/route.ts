"use server";

import { verifyEvent } from "nostr-tools";
import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

interface SignedObject {
  outbox: string[];
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

//バリデーション
const validation = (res: SignedObject) => {
  if (!verifyEvent(res.event)) throw new Error("不正なイベント");

  if (res.event.kind != 1) throw new Error("不正なkind");

  if (res.event.content.length > 1200)
    throw new Error("コンテンツが長すぎます");

  if (res.event.created_at * 1000 < new Date().getTime())
    throw new Error("過去が指定されています");

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
};

//インサート
const dbInsert = async (res: SignedObject, ip: string) => {
  const sendDay = new Date(res.event.created_at * 1000);

  sendDay.setUTCHours(0);
  sendDay.setUTCMinutes(0);
  sendDay.setUTCSeconds(0);
  sendDay.setUTCMilliseconds(0);

  await prisma.posts.create({
    data: { sendDay: sendDay, relays: res.outbox, event: res.event, ip: ip },
  });
};

//ip取得
const getIp = (req: NextRequest) => {
  let ip = req.ip ?? req.headers.get("x-real-ip") ?? "";
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (!ip && forwardedFor) {
    ip = forwardedFor.split(",").at(0) ?? "Unknown";
  }
  return ip;
};

export async function POST(req: NextRequest) {
  const ip = getIp(req);
  const res: SignedObject = await req.json();

  try {
    validation(res);
  } catch (e) {
    console.log(e);
    return new Response(`Unprocessable Entity`, { status: 422 });
  }

  await dbInsert(res, ip);

  return new Response("ok", { status: 200 });
}
