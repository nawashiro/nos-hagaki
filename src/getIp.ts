"use server";

import { NextRequest } from "next/server";

export const getIp = (req: NextRequest) => {
  let ip = req.ip ?? req.headers.get("x-real-ip") ?? "";
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (!ip && forwardedFor) {
    ip = forwardedFor.split(",").at(0) ?? "Unknown";
  }
  return ip;
};
