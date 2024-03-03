// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIp } from "./src/getIp";

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

    if (process.env.IS_MAINTENANCE == "true") {
      request.nextUrl.pathname = "/maintenance";
      return NextResponse.rewrite(request.nextUrl, { status: 503 });
    }
  }
};
