"use server";

import { verifyEvent } from "nostr-tools";

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

export async function POST(req: Request) {
  const res: SignedObject = await req.json();

  //バリデーション
  try {
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
  } catch (e) {
    console.log(e);
    return new Response(`Unprocessable Entity`, { status: 422 });
  }

  //日付を文字列に変換
  const createdAt = new Date(res.event.created_at * 1000);
  const UTCCreatedAtString = `${createdAt.getUTCFullYear()}-${createdAt.getUTCMonth()}-${createdAt.getUTCDate()}`;
  console.log(UTCCreatedAtString);

  return new Response("ok", { status: 200 });
}
