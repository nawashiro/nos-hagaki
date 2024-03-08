"use client";

import MoreLoadButton from "@/components/MoreLoadButton";
import ProfileButton from "@/components/profileButton";
import { FetchData } from "@/src/fetchData";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Author({ params }: { params: { pubkey: string } }) {
  const [moreLoadButtonValid, setMoreLoadButtonValid] = useState<boolean>(true);
  const fetchdata = new FetchData();
  const router = useRouter();
  const [follows, setFollows] = useState<string[]>([]);
  const [loadedNumber, setLoadedNumber] = useState<number>(0);

  //タイムライン取得
  const getEvent = async (pubkeys: string[]) => {
    let getPubkeys: string[];

    if (pubkeys.length < loadedNumber + 10) {
      getPubkeys = pubkeys.slice(loadedNumber);
      setLoadedNumber(pubkeys.length);
    } else {
      getPubkeys = pubkeys.slice(loadedNumber, loadedNumber + 10);
      setLoadedNumber(loadedNumber + 10);
    }

    setMoreLoadButtonValid(false);
    //kind-0取得
    await fetchdata.getProfile(getPubkeys);

    //すみか情報を取得
    await fetchdata.getRegionsWrapper(getPubkeys);

    setMoreLoadButtonValid(true);
  };

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

      //kind-10002取得
      await fetchdata.getExplicitRelayUrls(user.pubkey);

      //kind-3取得
      const newFollows =
        (await fetchdata.getFollows(params.pubkey, false)) || [];

      if (newFollows.length == 0) {
        return;
      }

      setFollows(newFollows);

      await getEvent(newFollows);
    };
    firstFetchdata();
  }, []);

  //さらに読み込むボタン押下時の処理
  const getMoreEvent = () => {
    getEvent(follows);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        {follows.slice(0, loadedNumber).map((pubkey, index) => (
          <ProfileButton
            pubkey={pubkey}
            key={index}
            value={pubkey}
            onClick={() => router.push(`/author/${pubkey}`)}
          />
        ))}
        <MoreLoadButton valid={moreLoadButtonValid} onClick={getMoreEvent} />
      </div>
    </div>
  );
}
