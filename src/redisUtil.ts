import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.KV_REST_API_URL ?? "expect redis url",
  token: process.env.KV_REST_API_TOKEN ?? "expect redis token",
});
