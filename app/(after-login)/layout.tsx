"use client";
import { useRouter } from "next/navigation";
import { createContext } from "react";
import { NDKSingleton } from "@/src/NDKSingleton";
import { NDKEventList } from "@/src/NDKEventList";

export const NDKContext = createContext(NDKSingleton.instance);
export const HomeTimelineEventList = createContext(new NDKEventList([]));

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
