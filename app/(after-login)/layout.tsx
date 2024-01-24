"use client";
import { useRouter } from "next/navigation";
import { useContext, createContext } from "react";
import { NDKSingleton } from "@/src/NDKSingleton";
import { NDKNip07Signer } from "@nostr-dev-kit/ndk";

export const NDKContext = createContext(NDKSingleton.instance);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  if (!localStorage.getItem("login")) {
    router.push("/");
  }

  const ndk = useContext(NDKContext);
  ndk.explicitRelayUrls = [
    "wss://nos.lol",
    "wss://relay.damus.io",
    "wss://relay-jp.nostr.wirednet.jp",
    "wss://nostr-relay.nokotaro.com",
    "wss://nostr.holybea.com",
    "wss://nostr.fediverse.jp",
    "wss://yabu.me",
  ];

  return <>{children}</>;
}
