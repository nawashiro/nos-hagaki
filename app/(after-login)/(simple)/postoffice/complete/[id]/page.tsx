"use server";

import CompleteClient from "./completeClient";
import { redis } from "@/src/redisUtil";

export default async function Complete({ params }: { params: { id: string } }) {
  const id = params.id;
  const key = `event-${id}`;

  const inserted: boolean | null = await redis.get(key);

  return inserted ? <CompleteClient /> : <h1>404 Not Found</h1>;
}
