"use server";
import { ServerNDKSingleton } from "@/src/ServerNDKSingleton";
import { NDKEvent, NDKRelay, NDKRelaySet } from "@nostr-dev-kit/ndk";
import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

function sleep(milliSeconds: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), milliSeconds);
  });
}

export async function GET(request: NextRequest) {
  //認証
  const authHeader = request.headers.get("authorization");
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

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

  //投函物を扱う
  for (const submit of submitteds) {
    const event = new NDKEvent(ndk);

    //イベントに値を設定する
    if (!submit.event) continue;
    event.kind = submit.event.kind;
    event.id = submit.event.id;
    event.content = submit.event.content;
    event.pubkey = submit.event.pubkey;
    event.created_at = submit.event.created_at;
    event.tags = [["p", submit.event.address]];
    event.sig = submit.event.sig;

    let ndkRelay = new Set<NDKRelay>();
    for (const relay of submit.relays) {
      ndkRelay = new Set<NDKRelay>([...ndkRelay, new NDKRelay(relay)]);
    }

    //送信する
    await event.publish(new NDKRelaySet(ndkRelay, ndk));

    //送信済みにする
    await prisma.submittedData.update({
      where: { id: submit.id },
      data: { sended: true },
    });

    await sleep(1000);
  }

  //60日以上前のレコードを削除
  const deleteDay = new Date();
  deleteDay.setUTCDate(deleteDay.getUTCDate() - 60);
  await prisma.submittedData.deleteMany({
    where: { sendDay: { lt: deleteDay } },
  });

  return new Response("ok", { status: 200 });
}
