"use client";

import { useEffect, useState } from "react";
import ProfileButton from "@/components/profileButton";
import { FetchData } from "@/src/fetchData";
import { useRouter } from "next/navigation";
import MoreLoadButton from "@/components/MoreLoadButton";

export default function Address() {
  const [moreLoadButtonValid, setMoreLoadButtonValid] = useState<boolean>(true);
  const fetchdata = new FetchData();
  const router = useRouter();
  const [loadedNumber, setLoadedNumber] = useState<number>(0);
  const [follows, setFollows] = useState<string[]>([]);

  //タイムライン取得
  const getEvent = async (pubkeys: string[]) => {
    let getPubkeys: string[];

    if (pubkeys.length < loadedNumber + 10) {
      getPubkeys = pubkeys.slice(loadedNumber);
    } else {
      getPubkeys = pubkeys.slice(loadedNumber, loadedNumber + 10);
    }

    setMoreLoadButtonValid(false);
    //kind-0取得
    await fetchdata.getProfile(getPubkeys);

    //すみか情報を取得
    await fetchdata.getRegionsWrapper(getPubkeys);

    setMoreLoadButtonValid(true);

    setLoadedNumber(loadedNumber + 10);
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
      const newFollows = (await fetchdata.getFollows(user.pubkey)) || [];

      setFollows(newFollows);

      getEvent(newFollows);
    };
    firstFetchdata();
  }, []);

  //さらに読み込むボタン押下時の処理
  const getMoreEvent = () => {
    getEvent(follows);
  };

  const addressSelect = (selectedPubkey: string) => {
    localStorage.setItem("address-pubkey", selectedPubkey);
    router.back();
  };
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold">お届け先を選ぶ</h2>
      <p>
        誰に届けるの？フォローしたユーザーから選べるわよ。
        <br />
        …べっ、別にあんたが誰をフォローしてるかなんて興味ないんだからっ！
      </p>
      <div className="space-y-4">
        {follows.map(
          (pubkey, index) =>
            fetchdata.regions.find((e) => e.pubkey == pubkey) && (
              <ProfileButton
                pubkey={pubkey}
                key={index}
                value={pubkey}
                onClick={(e) => addressSelect(e.currentTarget.value)}
              />
            )
        )}
        <MoreLoadButton valid={moreLoadButtonValid} onClick={getMoreEvent} />
      </div>
    </div>
  );
}
