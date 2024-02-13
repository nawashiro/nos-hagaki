import { getIp } from "@/src/getIp";
import { redis } from "@/src/redisUtil";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const ip = getIp(req);
  const id = req.nextUrl.searchParams.get("id");

  const sendAt: number | null = await redis.hget(`event-${id}`, "sendAt");

  if (!sendAt) {
    return new Response("not found", { status: 404 });
  }

  const submittedIp: string | null = await redis.hget(`event-${id}`, "ip");

  if (submittedIp != ip) {
    return new Response("Unauthorized", { status: 401 });
  }

  return NextResponse.json({ sendAt: sendAt }, { status: 200 });
}
