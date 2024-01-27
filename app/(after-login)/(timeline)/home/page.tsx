"use client";
import DivCard from "@/components/divCard";
import SimpleButton from "@/components/simpleButton";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { NDKContext } from "@/src/NDKContext";
import { getExplicitRelayUrls } from "@/src/getExplicitRelayUrls";
import { NDKFilter, NDKNip07Signer } from "@nostr-dev-kit/ndk";
import Timeline from "@/components/Timeline";

export default function Home() {
  const [messageReaded, setMessageReaded] = useState<boolean>(true);
  const ndk = useContext(NDKContext);
  const [filter, setFilter] = useState<NDKFilter>();

  useEffect(() => {
    setMessageReaded(localStorage.getItem("messageReaded") == "true");
  }, []);

  useEffect(() => {
    const fetchdata = async () => {
      const nip07signer = new NDKNip07Signer();
      const user = await nip07signer.user();

      if (!user.pubkey) {
        throw new Error("pubkey is false");
      }

      await getExplicitRelayUrls(ndk, user);

      setFilter({
        kinds: [1],
        authors: [user.pubkey],
        limit: 10,
      });
    };
    fetchdata();
  }, []);

  return (
    <div className="space-y-8">
      {!messageReaded ? (
        <DivCard>
          <p>
            おかえりなさい。あっ…いえ、初めましてかもしれないわね。
            <br />
            このアプリはWeb用のNostrクライアントよ。はがきを送りあうような操作感を目指しているの。
            <br />
            使い方はヘルプにまとめてあるし、右上からいつでも呼び出せるわ。
            <br />
            べっ、別にあんたのためじゃないんだからねっ！
          </p>
          <div className="flex space-x-4">
            <SimpleButton
              onClick={() => {
                localStorage.setItem("messageReaded", "true");
                setMessageReaded(true);
              }}
            >
              わかった
            </SimpleButton>
            <Link
              href={"#"}
              className="px-4 py-2 text-neutral-500 border-2 border-neutral-200 rounded-[2rem] hover:bg-neutral-200"
            >
              ヘルプを見る
            </Link>
          </div>
        </DivCard>
      ) : (
        <></>
      )}
      <Timeline filter={filter} />
    </div>
  );
}
