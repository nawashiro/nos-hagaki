"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FetchData } from "@/src/fetchData";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const fetchdata = new FetchData();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("login")) {
      router.push("/home");
    }
  }, []);

  const login = () => {
    fetchdata.getUser().then((user) => {
      if (!!user.npub) {
        localStorage.setItem(
          "privacy-policy-agree-date",
          new Date().toISOString()
        );
        localStorage.setItem(
          "terms-of-use-agree-date",
          new Date().toISOString()
        );
        localStorage.setItem("login", user.npub);
        router.push("/home");
      }
    });
  };

  const signup = () => {
    localStorage.setItem("privacy-policy-agree-date", new Date().toISOString());
    localStorage.setItem("terms-of-use-agree-date", new Date().toISOString());
    router.push("/signup");
  };

  return (
    <div className="space-y-8">
      <h1 className="font-bold text-2xl">NosHagaki β</h1>
      <p>
        これはWEB用のNostrクライアントです。
        <br />
        距離が開いていて時間が掛かる、「はがきのやり取り」のようなものを目指しています。
        <br />
        Nostr上の友達とはがきで文通してみませんか？
      </p>
      <div className="space-x-2">
        <input
          type="checkbox"
          onClick={(e) => {
            setChecked(e.currentTarget.checked);
          }}
        />
        <label>
          <Link
            href={"/privacy-policy"}
            className="text-neutral-400 underline hover:text-neutral-300"
          >
            プライバシーポリシー
          </Link>
          と
          <Link
            href={"/terms-of-use"}
            className="text-neutral-400 underline hover:text-neutral-300"
          >
            利用規約
          </Link>
          に同意する
        </label>
      </div>
      <div className="space-y-4">
        <button
          onClick={login}
          disabled={!checked}
          className={
            checked
              ? "block px-4 py-2 text-neutral-500 outline-2 outline outline-neutral-200 rounded-[2rem] hover:bg-neutral-200"
              : "block px-4 py-2 text-neutral-500 rounded-[2rem] bg-neutral-200"
          }
        >
          NIP-07ブラウザ拡張機能でログイン
        </button>
        <button
          onClick={signup}
          disabled={!checked}
          className={
            checked
              ? "block px-4 py-2 text-neutral-500 outline-2 outline outline-neutral-200 rounded-[2rem] hover:bg-neutral-200"
              : "block px-4 py-2 text-neutral-500 rounded-[2rem] bg-neutral-200"
          }
        >
          アカウント作成
        </button>
      </div>
    </div>
  );
}
