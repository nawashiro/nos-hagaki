"use client";

import ProfileIcon from "@/components/profileIcon";
import { FetchData } from "@/src/fetchData";
import { Region } from "@/src/getRegions";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DoubleReagionContext } from "@/src/context";
import { MultiLineBody } from "@/components/multiLineBody";
import DivCard from "@/components/divCard";
import Notice from "@/components/notice";
import LineMapWrapper from "@/components/lineMapWrapper";
import { getEventHash, nip19 } from "nostr-tools";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import Dialog from "@/components/dialog";
import Link from "next/link";

export default function Confirm() {
  const [addressProfile, setAddressProfile] = useState<any>();
  const [addresProfileEvent, setAddressProfileEvent] = useState<NDKEvent>();
  const [addressRegion, setAddressRegion] = useState<Region>();
  const [textContent, setTextContent] = useState<string>();
  const [myProfile, setMyProfile] = useState<any>();
  const fetchdata = new FetchData();
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState<number>();
  const [myRegion, setMyRegion] = useState<Region>();
  const [pubkey, setPubkey] = useState<string>();
  const [addressNpub, setAddressNpub] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const firstFetchdata = async () => {
      //NIP-07によるユーザ情報取得
      let user;
      try {
        if (!localStorage.getItem("login")) {
          throw new Error("未ログイン");
        }
        user = await fetchdata.getUser();
      } catch {
        router.push("/");
        return;
      }
      setPubkey(user.pubkey);

      //kind-10002取得
      await fetchdata.getExplicitRelayUrls(user.pubkey);

      //データの存在チェック

      const addressNpub = localStorage.getItem("address-pubkey");

      if (!addressNpub) {
        throw new Error("アドレスが指定されていません。");
      }

      setAddressNpub(addressNpub);

      const newTextContent = localStorage.getItem("draft-text");

      if (!newTextContent) {
        throw new Error("本文が空です。");
      }

      if (newTextContent.length > 1200) {
        throw new Error("本文を1200文字以下にしてください。");
      }

      setTextContent(newTextContent);

      //===お届け先===

      //kind-0取得
      const newAddressProfile = await fetchdata.getAloneProfile(addressNpub);
      newAddressProfile && setAddressProfileEvent(newAddressProfile);
      setAddressProfile(
        newAddressProfile ? JSON.parse(newAddressProfile.content) : {}
      );

      //すみか情報を取得
      setAddressRegion(await fetchdata.getAloneRegion(addressNpub));
      setEstimatedDeliveryTime(
        await fetchdata.getEstimatedDeliveryTime(user.pubkey, addressNpub)
      );

      //===自分===

      //kind-0取得
      const newMyProfile = await fetchdata.getAloneProfile(user.pubkey);
      setMyProfile(newMyProfile ? JSON.parse(newMyProfile.content) : {});

      setMyRegion(await fetchdata.getAloneRegion(user.pubkey));
    };
    firstFetchdata();
  }, []);

  const publish = async () => {
    if (
      !window.nostr ||
      !pubkey ||
      !textContent ||
      !addressNpub ||
      !fetchdata.user?.pubkey
    )
      return;

    //数日後のUTC22:00を設定
    const date = new Date();
    const daysRequired = await fetchdata.getEstimatedDeliveryTime(
      fetchdata.user.pubkey,
      addressNpub
    );

    date.setUTCDate(date.getUTCDate() + daysRequired);
    date.setUTCHours(22);
    date.setUTCMinutes(0);
    date.setUTCSeconds(0);
    date.setUTCMilliseconds(0);

    const createdAt = Math.floor(date.getTime() / 1000);

    const raw = {
      kind: 1,
      content: textContent,
      pubkey: pubkey,
      created_at: createdAt,
      tags: [["p", addressNpub]],
    };

    //署名する
    const sign = await window.nostr.signEvent(raw);
    const id = getEventHash(raw);

    const signed = {
      ...raw,
      sig: sign.sig,
      id: id,
    };

    const signedObject = {
      outbox: fetchdata.outboxRelays,
      event: signed,
    };

    const res = await fetch("/api/post-insert", {
      method: "POST",
      body: JSON.stringify(signedObject),
    });

    if (res.status != 200) {
      if (res.status == 429) {
        setErrorMessage(
          `${res.status} エラー\nレート制限がかかっているようね。残念だけど、1時間に6通のはがきしか送れないの。\nしばらく待ってからもう一度試してみなさい！`
        );
      } else {
        setErrorMessage(`${res.status} エラー`);
      }
      return;
    }

    localStorage.removeItem("address-pubkey");
    localStorage.removeItem("draft-text");

    router.push(`./complete/${signedObject.event.id}`);
  };

  return (
    <>
      <Dialog valid={!!errorMessage}>
        <h2 className="font-bold">エラー</h2>
        <MultiLineBody body={errorMessage} />
        <Link
          href={"/home"}
          className="px-4 py-2 inline-block text-neutral-500 outline-2 outline outline-neutral-200 rounded-[2rem] hover:bg-neutral-200"
        >
          ホームへ戻る
        </Link>
      </Dialog>
      <div className="space-y-8">
        <h2 className="text-xl font-bold">確認をする</h2>
        <Image
          src={"/img/m11.webp"}
          alt="はがきを投函する様子"
          width={640}
          height={360}
        />
        <p>
          もう投函できるわ。でもちょっと待ちなさい！
          <br />
          ここが内容を確認する最後のチャンスなの。誤りがあったらあんたが困るんだから、ちゃんと確認しなさい。
          <br />
          べっ、別にあんたのことを思って言ってるんじゃないんだからね！
        </p>
        <p>お届け先はこれでいいのね？</p>
        {addressProfile && (
          <div className="w-full p-4 rounded-2xl outline-2 outline outline-neutral-200 space-y-8">
            <div className="space-y-4">
              <ProfileIcon picture={addressProfile.picture} />
              <div>
                {addressProfile?.display_name && (
                  <p className="font-bold">{addressProfile.display_name}</p>
                )}
                {addresProfileEvent && (
                  <p className="text-neutral-500 break-all">
                    @
                    {addressProfile.name ||
                      nip19.npubEncode(addresProfileEvent.pubkey)}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <p className="font-bold">みちのり</p>
              {addressRegion && myRegion && (
                <DoubleReagionContext.Provider
                  value={{ address: addressRegion, my: myRegion }}
                >
                  <LineMapWrapper />
                </DoubleReagionContext.Provider>
              )}
              <div>
                <p>{addressRegion?.countryName?.ja || "どこか…"}</p>
                <div className="space-x-2 flex">
                  <p className="font-normal">かかる日数:</p>
                  <p>{estimatedDeliveryTime || "…"}日</p>
                </div>
              </div>
            </div>
          </div>
        )}
        <p>内容はこれでいいのね？</p>
        {textContent && myProfile && (
          <DivCard>
            <ProfileIcon picture={myProfile.picture} />
            <MultiLineBody body={textContent} pointerEventNone={true} />
          </DivCard>
        )}
        <p>最後に、注意事項を確かめておくのよ！</p>
        <Notice />
        <p>これでいいのね？なら「投函する」を押してもいいんじゃない？</p>
        <button
          onClick={publish}
          className="w-full bg-[#E10014] px-4 py-2 text-white rounded-[2rem] hover:opacity-50"
        >
          投函する
        </button>
      </div>
    </>
  );
}
