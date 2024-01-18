"use client";
import { useRouter } from "next/navigation";
import React from "react";

export default function Home() {
  const router = useRouter();

  React.useEffect(() => {
    router.push("/home");
  });

  return;
}
