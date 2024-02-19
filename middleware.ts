// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { redis } from "./src/redisUtil";
import { getIp } from "./src/getIp";

const getTorIps = async () => {
  const res = await fetch("https://check.torproject.org/torbulkexitlist");

  if (!res.ok) {
    throw new Error("Tor出口IPアドレス取得に失敗しました");
  }

  const resText = await res.text();
  const exitIps = new Set<string>(resText.split("\n"));
  await redis.sadd("tor-exit-ips", ...exitIps);
  await redis.expire("tor-exit-ips", 30 * 60);
};

export const middleware = async (request: NextRequest) => {
  const ip = getIp(request);

  if (!(await redis.exists("tor-exit-ips"))) {
    try {
      await getTorIps();
      console.log("Tor出口IPリストを取得しました");
    } catch (e) {
      console.log("エラー: " + e);
      return new NextResponse(null, { status: 500 });
    }
  }

  if ((await redis.smembers("tor-exit-ips")).find((element) => element == ip)) {
    return new NextResponse(null, { status: 401 });
  }

  const country = request.geo?.country;

  if (process.env.NODE_ENV === "production") {
    if (country && country !== "JP") {
      console.info(
        `IPアドレスが日本以外のため、アクセスを拒否しました。[request.ip = ${request.ip}]`
      );
      return new NextResponse(null, { status: 401 });
    }
  }
};
