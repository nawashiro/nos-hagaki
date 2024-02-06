"use client";

import { useEffect } from "react";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { Region } from "@/src/getRegions";
import { create } from "zustand";
import ProfileButton from "@/components/profileButton";
import { FetchData } from "@/src/fetchData";
import { useRouter } from "next/navigation";

interface State {
  regions: Region[];
  profiles: NDKEvent[];
  follows: string[];
}

const useStore = create<State>((set) => ({
  regions: [],
  profiles: [],
  follows: [],
}));

export default function Address() {
  const fetchdata = new FetchData();
  const router = useRouter();

  useEffect(() => {
    const firstFetchdata = async () => {
      //NIP-07によるユーザ情報取得
      const user = await fetchdata.getUser();

      //kind-10002取得
      await fetchdata.getExplicitRelayUrls(user.pubkey);

      //kind-3取得
      const follows = (await fetchdata.getFollows(user.pubkey)) || [];

      //kind-0取得
      await fetchdata.getProfile(follows);

      //すみか情報を取得
      await fetchdata.getRegionsWrapper(follows);
    };
    firstFetchdata();
  }, []);

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
        {fetchdata.follows.map((pubkey, index) => (
          <ProfileButton
            pubkey={pubkey}
            profiles={fetchdata.profiles}
            regions={fetchdata.regions}
            key={index}
            value={pubkey}
            onClick={(e) => addressSelect(e.currentTarget.value)}
          />
        ))}
      </div>
    </div>
  );
}
