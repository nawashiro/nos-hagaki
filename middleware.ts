// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIp } from "./src/getIp";
import { get } from "@vercel/edge-config";

export const middleware = async (request: NextRequest) => {
  const ip = getIp(request);

  if (process.env.NODE_ENV === "production") {
    const country = request.geo?.country;

    //cron実行でないならば
    if (!request.url.endsWith("/api/cron")) {
      //日本国外をブロック
      if (country && country !== "JP") {
        console.info(
          `IPアドレスが日本以外のため、アクセスを拒否しました。[request.ip = ${request.ip}] [country = ${country}] [request.url = ${request.url}]`
        );
        return new NextResponse(null, { status: 403 });
      }
    }

    //ブロックIPリストに含まれるIPをブロック
    const blockIps = await get<string[]>("blockIps");
    if (ip && blockIps?.includes(ip)) {
      console.info(
        "IPアドレスがブロックIPリストに一致したため、アクセスを拒否しました。"
      );
      return new NextResponse(null, { status: 403 });
    }

    const isMaintenance = await get("isMaintenance");
    if (isMaintenance) {
      request.nextUrl.pathname = "/maintenance";
      return NextResponse.rewrite(request.nextUrl, { status: 503 });
    }
  }
};
