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

export default function Confirm() {
  const [addressProfile, setAddressProfile] = useState<any>();
  const [addressRegion, setAddressRegion] = useState<Region>();
  const [textContent, setTextContent] = useState<string>();
  const [myProfile, setMyProfile] = useState<any>();
  const fetchdata = new FetchData();
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState<number>();
  const [myRegion, setMyRegion] = useState<Region>();
  const router = useRouter();

  useEffect(() => {
    const firstFetchdata = async () => {
      //NIP-07によるユーザ情報取得
      const user = await fetchdata.getUser();

      //kind-10002取得
      await fetchdata.getExplicitRelayUrls(user.pubkey);

      const addressNpub = localStorage.getItem("address-pubkey");

      //データの存在チェック
      if (!addressNpub) {
        throw new Error("アドレスが指定されていません。");
      }

      const newTextContent = localStorage.getItem("draft-text");

      if (!newTextContent) {
        throw new Error("本文が空です。");
      }

      setTextContent(newTextContent);

      //===お届け先===

      //kind-0取得
      const newAddressProfile = await fetchdata.getAloneProfile(addressNpub);
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
  return (
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
              {addressProfile?.name && (
                <p className="text-neutral-500 break-all">
                  @{addressProfile.name}
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
          <MultiLineBody body={textContent} />
        </DivCard>
      )}
      <p>最後に、注意事項を確かめておくのよ！</p>
      <Notice />
      <p>これでいいのね？なら「投函する」を押してもいいんじゃない？</p>
      <button className="w-full bg-[#E10014] px-4 py-2 text-white rounded-[2rem] hover:opacity-50">
        投函する
      </button>
    </div>
  );
}
