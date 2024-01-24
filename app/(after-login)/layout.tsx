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
  const nip07signer = new NDKNip07Signer();

  nip07signer.user().then(async (user) => {
    if (localStorage.getItem("login") != user.npub) {
      localStorage.clear();
      router.push("/");
    }
  });

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
