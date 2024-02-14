"use client";

import DivCard from "@/components/divCard";
import { MultiLineBody } from "@/components/multiLineBody";
import ProfileIcon from "@/components/profileIcon";
import SimpleButton from "@/components/simpleButton";
import { FetchData } from "@/src/fetchData";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import Link from "next/link";
import { nip19 } from "nostr-tools";
import { useEffect, useState } from "react";

export default function Complete({ params }: { params: { id: string } }) {
  const [dateString, setDateString] = useState<string>();
  const [messageTextContent, setMessageTextContent] = useState<string>("");
  const [address, setAddress] = useState<string>();
  const [myProfile, setMyProfile] = useState<any>();
  const [pubkey, setPubkey] = useState<string>();
  const fetchdata = new FetchData();
  const [messageSubmitted, setMessageSubmitted] = useState<string>();

  useEffect(() => {
    const firstFetch = async () => {
      const res = await fetch(`/api/complete-result?id=${params.id}`);
      if (res.status != 200) {
        throw new Error(res.status.toString());
      }
      const data = await res.json();
      const sendAt: number = data.sendAt;
      const address: string = data.address;
      setAddress(address);

      var sendDay = new Date(sendAt * 1000);
      var year = sendDay.getFullYear();
      var month = sendDay.getMonth() + 1;
      var day = sendDay.getDate();
      const dateString = year + "年" + month + "月" + day + "日";
      setDateString(dateString);

      //NIP-07によるユーザ情報取得
      const user = await fetchdata.getUser();
      setPubkey(user.pubkey);

      //kind-10002取得
      await fetchdata.getExplicitRelayUrls(user.pubkey);

      //kind-0取得(自分)
      const newMyProfile = await fetchdata.getAloneProfile(user.pubkey);
      setMyProfile(newMyProfile ? JSON.parse(newMyProfile.content) : {});

      setMessageTextContent(
        `nostr:${nip19.npubEncode(
          address
        )} 樣宛にはがきを発送しました。\nお届け予定日 ${dateString}\nnostr:${nip19.noteEncode(
          params.id
        )}`
      );
    };
    firstFetch();
  }, []);

  const sendMessage = async () => {
    if (!address || !pubkey) {
      return;
    }
    const message = new NDKEvent();
    message.kind = 1;
    message.tags = [["p", address]];
    message.content = messageTextContent;
    const submitted = await fetchdata.publish(message);
    if (submitted.size > 0) {
      setMessageSubmitted("送りました");
    } else {
      setMessageSubmitted("送れませんでした");
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold">投函しました</h2>
      <p>
        投函できたようね！
        <br />
        お届け予定日をお知らせするわ。
      </p>
      <p className="font-bold">お届け予定日 {dateString || "いつか…"}</p>
      <p>お届け予定日をお届け先に知らせておくこともできるわよ？</p>
      <DivCard>
        <ProfileIcon picture={myProfile?.picture} />
        <MultiLineBody body={messageTextContent} />
        {messageSubmitted ? (
          <div className="px-4 py-2 inline-block text-neutral-500 rounded-[2rem] bg-neutral-200">
            {messageSubmitted}
          </div>
        ) : (
          <SimpleButton onClick={sendMessage}>メッセージを送る</SimpleButton>
        )}
      </DivCard>
      <p>
        また、誰かに何かを送りたくなったら来なさい。…いつでも、待ってるから。
      </p>
      <Link
        href={"/home"}
        className="px-4 py-2 block text-center text-neutral-500 outline-2 outline outline-neutral-200 rounded-[2rem] hover:bg-neutral-200"
      >
        ホームへ戻る
      </Link>
    </div>
  );
}
