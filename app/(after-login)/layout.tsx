"use client";
import { useRouter } from "next/navigation";
import React from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  if (!localStorage.getItem("login")) {
    router.push("/");
  }

  return <>{children}</>;
}
