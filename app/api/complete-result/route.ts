import { getIp } from "@/src/getIp";
import { redis } from "@/src/redisUtil";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const ip = getIp(req);
  const id = req.nextUrl.searchParams.get("id");
  const key = `event-${id}`;

  const sendAt: number | null = await redis.hget(key, "sendAt");

  if (!sendAt) {
    return new Response("not found", { status: 404 });
  }

  const submittedIp: string | null = await redis.hget(key, "ip");

  if (submittedIp != ip) {
    return new Response("Unauthorized", { status: 401 });
  }

  const address = await redis.hget(key, "address");

  return NextResponse.json(
    { sendAt: sendAt, address: address },
    { status: 200 }
  );
}
