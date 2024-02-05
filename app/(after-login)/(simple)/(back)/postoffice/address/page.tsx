"use client";

import { useContext, useEffect } from "react";
import { NDKEvent, NDKFilter, NDKNip07Signer } from "@nostr-dev-kit/ndk";
import { getExplicitRelayUrls } from "@/src/getExplicitRelayUrls";
import { Region, getRegions } from "@/src/getRegions";
import { create } from "zustand";
import { NDKContext } from "@/src/context";
import { getFollows } from "@/src/getFollows";
import { contentStore } from "@/src/contentStore";
import ProfileButton from "@/components/profileButton";

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
  const ndk = useContext(NDKContext);
  const { regions, profiles, follows } = useStore();
  const regionsPush = contentStore((state) => state.regionsPush);
  const storedRegions = contentStore((state) => state.regions);
  const profilesPush = contentStore((state) => state.profilesPush);
  const storedProfiles = contentStore((state) => state.profiles);
  const followsPush = contentStore((state) => state.followsPush);
  const storedFollows = contentStore((state) => state.follows);

  useEffect(() => {
    const fetchdata = async () => {
      //NIP-07によるユーザ情報取得
      const nip07signer = new NDKNip07Signer();
      const user = await nip07signer.user();

      if (!user.pubkey) {
        throw new Error("pubkey is false");
      }

      //kind-10002取得
      await getExplicitRelayUrls(ndk, user);

      let newFollows = storedFollows;

      //kind-3取得
      if (newFollows.length == 0) {
        newFollows = await getFollows(ndk, user);
        useStore.setState({ follows: newFollows });
        followsPush(newFollows);
      }

      //kind-0取得
      let mustGetProfilePubkey: string[] = [];
      for (const pubkey of newFollows) {
        if (!storedProfiles.find((element) => element.pubkey == pubkey)) {
          mustGetProfilePubkey = [...mustGetProfilePubkey, pubkey];
        }
      }
      let newProfiles = new Set<NDKEvent>();
      if (mustGetProfilePubkey.length > 0) {
        const kind0Filter: NDKFilter = {
          kinds: [0],
          authors: mustGetProfilePubkey,
        };
        newProfiles = await ndk.fetchEvents(kind0Filter);
      }
      useStore.setState({
        profiles: [...storedProfiles, ...Array.from(newProfiles)],
      });
      profilesPush(newProfiles);

      //すみか情報を取得
      let mustGetRegionPubkey: string[] = [];
      for (const pubkey of newFollows) {
        if (!storedRegions.find((element) => element.pubkey == pubkey)) {
          mustGetRegionPubkey = [...mustGetRegionPubkey, pubkey];
        }
      }
      let newRegions: Region[] = [];
      if (mustGetRegionPubkey.length > 0) {
        newRegions = await getRegions(mustGetRegionPubkey);
      }
      useStore.setState({ regions: [...storedRegions, ...newRegions] });
      regionsPush(newRegions);
    };
    fetchdata();
  }, []);
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold">お届け先を選ぶ</h2>
      <p>
        誰に届けるの？フォローしたユーザーから選べるわよ。
        <br />
        …べっ、別にあんたが誰をフォローしてるかなんて興味ないんだからっ！
      </p>
      <div className="space-y-4">
        {follows.map((pubkey, index) => (
          <ProfileButton
            pubkey={pubkey}
            profiles={profiles}
            regions={regions}
            key={index}
          />
        ))}
      </div>
    </div>
  );
}
