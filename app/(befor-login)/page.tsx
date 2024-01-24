"use client";
import { useRouter } from "next/navigation";
import React from "react";
import { NDKNip07Signer } from "@nostr-dev-kit/ndk";
import SimpleButton from "@/components/simpleButton";

export default function Home() {
  const router = useRouter();

  if (localStorage.getItem("login")) {
    router.push("/home");
  }

  const login = () => {
    const nip07signer = new NDKNip07Signer();
    nip07signer.user().then(async (user) => {
      if (!!user.npub) {
        localStorage.setItem("login", user.npub);
        router.push("/home");
      }
    });
  };

  return (
    <div className="space-y-4">
      <h1 className="font-bold text-2xl">NosHagaki</h1>
      <p>
        これはWEB用のNostrクライアントです。
        <br />
        手間がかかるし、時間がかかるし、一人語りもできません。
        <br />
        ただ、はがきのような操作感を目指しています。
        <br />
        あとツンデレ。
      </p>
      <SimpleButton onClick={login}>NIP-7拡張機能でログイン</SimpleButton>
    </div>
  );
}
