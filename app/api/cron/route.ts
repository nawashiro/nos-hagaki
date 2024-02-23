"use server";
import { ServerNDKSingleton } from "@/src/ServerNDKSingleton";
import { NDKEvent, NDKRelay, NDKRelaySet } from "@nostr-dev-kit/ndk";
import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";
import { SimplePool } from "nostr-tools";

const prisma = new PrismaClient();

function sleep(milliSeconds: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), milliSeconds);
  });
}

export async function GET(request: NextRequest) {
  if (request.geo?.country == "US") {
    console.info("US以外からのcronへのアクセスをブロックしました。");
  }
  //認証
  const authHeader = request.headers.get("authorization");
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    console.info("cronの呼び出しがありましたが、認証に失敗しました。");
    return new Response("Unauthorized", { status: 401 });
  }
  console.info("cronの呼び出しがありました。認証に成功しました。");

  const today = new Date();
  today.setUTCHours(0);
  today.setUTCMinutes(0);
  today.setUTCSeconds(0);
  today.setUTCMilliseconds(0);

  //今日もしくは今日より前の未送信イベントを抽出
  const submitteds = await prisma.submittedData.findMany({
    where: {
      AND: [{ sended: { equals: false } }, { sendDay: { lte: today } }],
    },
    include: { event: true },
  });

  const ndk = ServerNDKSingleton.instance;

  console.info(`${submitteds.length}件の送信を開始しました。`);
  //投函物を扱う
  for (const submit of submitteds) {
    const pool = new SimplePool();

    //イベントに値を設定する
    if (!submit.event) continue;

    const event = {
      kind: submit.event.kind,
      id: submit.event.id,
      content: submit.event.content,
      pubkey: submit.event.pubkey,
      created_at: submit.event.created_at,
      tags: [["p", submit.event.address]],
      sig: submit.event.sig,
    };

    //送信する
    try {
      await Promise.any(pool.publish(submit.relays, event));
    } catch (e) {
      console.info("送信に失敗しました。" + e);
    }

    //送信済みにする
    await prisma.submittedData.update({
      where: { id: submit.id },
      data: { sended: true },
    });

    await sleep(1000);
  }
  console.info("送信が完了しました。");

  //60日以上前のレコードを削除
  const deleteDay = new Date();
  deleteDay.setUTCDate(deleteDay.getUTCDate() - 60);
  await prisma.submittedData.deleteMany({
    where: { sendDay: { lt: deleteDay } },
  });

  return new Response("ok", { status: 200 });
}
