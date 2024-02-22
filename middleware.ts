// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { redis } from "./src/redisUtil";
import { getIp } from "./src/getIp";
import { get } from "@vercel/edge-config";

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

  if (process.env.NODE_ENV === "production") {
    const cronIp = await get<string>("cronIp");

    //vercelによるcron実行でないならば
    if (
      !(request.url == `${process.env.VERCEL_URL}/api/cron` && ip == cronIp)
    ) {
      //Tor出口IPリストを取得
      if (!(await redis.exists("tor-exit-ips"))) {
        try {
          await getTorIps();
          console.info("Tor出口IPリストを取得しました");
        } catch (e) {
          console.info("エラー: " + e);
          return new NextResponse(null, { status: 500 });
        }
      }

      //Torをブロック
      if (
        (await redis.smembers("tor-exit-ips")).find((element) => element == ip)
      ) {
        console.info(
          "IPアドレスがTor出口IPリストに一致したため、アクセスを拒否しました。"
        );
        return new NextResponse(null, { status: 403 });
      }

      //日本国外をブロック
      const country = request.geo?.country;

      if (country && country !== "JP") {
        console.info(
          `IPアドレスが日本以外のため、アクセスを拒否しました。[request.ip = ${request.ip}]`
        );
        return new NextResponse(null, { status: 403 });
      }

      //ブロックIPリストに含まれるIPをブロック
      const blockIps = await get<string[]>("blockIps");
      if (ip && blockIps?.includes(ip)) {
        console.info(
          "IPアドレスがブロックIPリストに一致したため、アクセスを拒否しました。"
        );
        return new NextResponse(null, { status: 403 });
      }
    }

    const isMaintenance = await get("isMaintenance");
    if (isMaintenance) {
      request.nextUrl.pathname = "/maintenance";
      return NextResponse.rewrite(request.nextUrl, { status: 503 });
    }
  }
};
