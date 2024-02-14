"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import SimpleButton from "@/components/simpleButton";
import { FetchData } from "@/src/fetchData";

export default function Home() {
  const router = useRouter();
  const fetchdata = new FetchData();

  useEffect(() => {
    if (localStorage.getItem("login")) {
      router.push("/home");
    }
  }, []);

  const login = () => {
    fetchdata.getUser().then((user) => {
      if (!!user.npub) {
        localStorage.setItem("login", user.npub);
        router.push("/home");
      }
    });
  };

  return (
    <div className="space-y-4">
      <h1 className="font-bold text-2xl">NosHagaki β</h1>
      <p>
        これはWEB用のNostrクライアントです。
        <br />
        距離が開いていて時間が掛かる、「はがきのやり取り」のようなものを目指しています。
        <br />
        Nostr上の友達とはがきを送りあってみませんか？
      </p>
      <SimpleButton onClick={login}>
        NIP-07ブラウザ拡張機能でログイン
      </SimpleButton>
    </div>
  );
}
