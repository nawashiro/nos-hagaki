"use client";
import ProfileButton from "@/components/profileButton";
import { FetchData } from "@/src/fetchData";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { nip19 } from "nostr-tools";
import { create } from "zustand";
import { NDKUser } from "@nostr-dev-kit/ndk";

interface State {
  npub: string;
  pubkey: string;
}

const useStore = create<State>((set) => ({
  npub: "",
  pubkey: "",
}));

export default function Setting() {
  const fetchdata = new FetchData();
  const router = useRouter();
  const { npub, pubkey } = useStore();
  const [user, setUser] = useState<NDKUser>();

  useEffect(() => {
    const firstFetchData = async () => {
      //NIP-07によるユーザ情報取得
      let user;
      try {
        if (!localStorage.getItem("login")) {
          throw new Error("未ログイン");
        }
        user = await fetchdata.getUser();
        setUser(user);
      } catch {
        router.push("/");
        return;
      }

      //kind-10002取得
      await fetchdata.getExplicitRelayUrls(user.pubkey);
    };
    firstFetchData();
  }, []);

  const search = async () => {
    if (!npub || !user) {
      return;
    }
    //kind-0取得
    const { data, type } = nip19.decode(npub);
    let pubkey: string;
    let relays: string[] = [];
    if (type == "nprofile") {
      pubkey = data.pubkey;
      if (data.relays !== undefined) {
        relays = data.relays;
      }
    } else if (type == "npub") {
      pubkey = data;
    } else {
      return;
    }
    useStore.setState({ pubkey: pubkey });
    await fetchdata.getAloneProfile(pubkey, relays);
    await fetchdata.getAloneRegion(pubkey);
    await fetchdata.getEstimatedDeliveryTime(user.pubkey, pubkey);
  };

  return (
    <div className="space-y-8">
      <div className="space-x-2 flex">
        <input
          type="text"
          placeholder="npub or nprofile"
          value={npub}
          onChange={(e) => {
            useStore.setState({ npub: e.currentTarget.value });
          }}
          className="rounded-lg outline-2 outline outline-neutral-200 px-2 py-1 grow"
        />
        <button
          onClick={search}
          className="rounded-lg outline-2 outline outline-neutral-200 px-2 py-1 hover:bg-neutral-200"
        >
          検索
        </button>
      </div>
      <div className="space-y-4">
        {pubkey && (
          <ProfileButton
            pubkey={pubkey}
            value={pubkey}
            onClick={(e) => {
              router.push(`/author/${e.currentTarget.value}`);
            }}
          />
        )}
      </div>
    </div>
  );
}
