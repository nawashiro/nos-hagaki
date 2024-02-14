"use client";
import DivCard from "@/components/divCard";
import SimpleButton from "@/components/simpleButton";
import Link from "next/link";
import { useEffect, useState } from "react";
import { RegionContext } from "@/src/context";
import { NDKFilter } from "@nostr-dev-kit/ndk";
import Timeline from "@/components/Timeline";
import { Region } from "@/src/getRegions";
import MapWrapper from "@/components/mapWrapper";
import { NDKEventList } from "@/src/NDKEventList";
import { create } from "zustand";
import { MdOutlineOpenInNew } from "react-icons/md";
import ProfileIcon from "@/components/profileIcon";
import { FetchData } from "@/src/fetchData";

interface State {
  filter: NDKFilter;
  myProfile: any;
  timeline: NDKEventList;
  region: Region | undefined;
}

const useStore = create<State>((set) => ({
  filter: {},
  myProfile: {},
  timeline: new NDKEventList(),
  region: undefined,
}));

export default function Home() {
  const [messageReaded, setMessageReaded] = useState<boolean>(true); //ログイン時メッセージ表示可否
  const [moreLoadButtonValid, setMoreLoadButtonValid] = useState<boolean>(true);
  const { filter, myProfile, timeline, region } = useStore();

  const fetchdata = new FetchData();

  //タイムライン取得
  const getEvent = async (filter: NDKFilter) => {
    if (filter) {
      setMoreLoadButtonValid(false);
      timeline.concat(await fetchdata.getNotes(filter));
      setMoreLoadButtonValid(true);
    }
  };

  //さらに読み込むボタン押下時の処理
  const getMoreEvent = () => {
    getEvent({ ...filter, until: timeline.until });
  };

  useEffect(() => {
    const fitstFetchdata = async () => {
      //NIP-07によるユーザ情報取得
      const user = await fetchdata.getUser();

      //すみか情報取得
      useStore.setState({
        region: await fetchdata.getAloneRegion(user.pubkey),
      });

      //kind-10002取得
      await fetchdata.getExplicitRelayUrls(user.pubkey);

      //kind-0取得
      const newMyProfile = await fetchdata.getAloneProfile(user.pubkey);

      useStore.setState({
        myProfile: newMyProfile ? JSON.parse(newMyProfile.content) : {},
      });

      //kind-1取得
      const kind1Filter: NDKFilter = {
        kinds: [1],
        authors: [user.pubkey],
        limit: 10,
      };

      if (timeline.eventList.size == 0) {
        await getEvent(kind1Filter);
      }

      useStore.setState({ filter: kind1Filter });
    };
    setMessageReaded(localStorage.getItem("messageReaded") == "true");
    fitstFetchdata();
  }, []);

  return (
    <div className="space-y-8">
      {!messageReaded && (
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
              href={"/help"}
              className="px-4 py-2 text-neutral-500 outline-2 outline outline-neutral-200 rounded-[2rem] hover:bg-neutral-200"
            >
              ヘルプを見る
            </Link>
          </div>
        </DivCard>
      )}

      <div className="space-y-4">
        <ProfileIcon picture={myProfile.picture} />

        <div>
          {myProfile.display_name && (
            <p className="font-bold">{myProfile.display_name}</p>
          )}
          {fetchdata.user && (
            <p className="text-neutral-500 break-all">
              @{myProfile.name || fetchdata.user.npub}
            </p>
          )}
        </div>

        <div>
          {myProfile.website && (
            <>
              <a
                className="break-words text-neutral-400 underline hover:text-neutral-300"
                href={myProfile.website}
                target="_blank"
              >
                {myProfile.website}
                <MdOutlineOpenInNew className="inline-block h-4 w-4 mb-[7.2px]" />
              </a>
            </>
          )}
          {myProfile.about && <p>{myProfile.about}</p>}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-bold">あなたのすみか</h2>
        {region && (
          <RegionContext.Provider value={region}>
            <MapWrapper />
          </RegionContext.Provider>
        )}
        <p>{region?.countryName?.ja || "どこか…"}</p>
      </div>

      <Timeline
        regions={fetchdata.regions}
        profiles={fetchdata.profiles}
        getMoreEvent={getMoreEvent}
        timeline={timeline}
        moreLoadButtonValid={moreLoadButtonValid}
      />
    </div>
  );
}
