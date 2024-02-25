"use client";

import Timeline from "@/components/Timeline";
import MapWrapper from "@/components/mapWrapper";
import { MultiLineBody } from "@/components/multiLineBody";
import ProfileIcon from "@/components/profileIcon";
import { NDKEventList } from "@/src/NDKEventList";
import { RegionContext } from "@/src/context";
import { FetchData } from "@/src/fetchData";
import { Region } from "@/src/getRegions";
import { NDKFilter } from "@nostr-dev-kit/ndk";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MdOutlineOpenInNew } from "react-icons/md";
import { create } from "zustand";

interface State {
  filter: NDKFilter;
  myProfile: any;
  region: Region | undefined;
}

const useStore = create<State>((set) => ({
  filter: {},
  myProfile: {},
  region: undefined,
}));

export default function Author({ params }: { params: { pubkey: string } }) {
  const [moreLoadButtonValid, setMoreLoadButtonValid] = useState<boolean>(true);
  const { filter, myProfile, region } = useStore();
  const fetchdata = new FetchData();
  const router = useRouter();
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState<number>();
  const [timeline, setTimeline] = useState(new NDKEventList());

  //タイムライン取得
  const getEvent = async (filter: NDKFilter) => {
    if (filter) {
      setMoreLoadButtonValid(false);
      setTimeline(timeline.concat(await fetchdata.getNotes(filter)));
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

      //すみか情報取得
      useStore.setState({
        region: await fetchdata.getAloneRegion(params.pubkey),
      });

      if (user.pubkey != params.pubkey) {
        setEstimatedDeliveryTime(
          await fetchdata.getEstimatedDeliveryTime(user.pubkey, params.pubkey)
        );
      }

      //kind-10002取得
      await fetchdata.getExplicitRelayUrls(user.pubkey);

      //kind-0取得
      const newMyProfile = await fetchdata.getAloneProfile(params.pubkey);

      useStore.setState({
        myProfile: newMyProfile ? JSON.parse(newMyProfile.content) : {},
      });

      //kind-1取得
      const kind1Filter: NDKFilter = {
        kinds: [1],
        authors: [params.pubkey],
        limit: 10,
      };

      if (timeline.eventList.size == 0) {
        await getEvent(kind1Filter);
      }

      useStore.setState({ filter: kind1Filter });
    };
    fitstFetchdata();
  }, []);
  return (
    <div className="space-y-8">
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
            <a
              className="break-words text-neutral-400 underline hover:text-neutral-300"
              href={(() => {
                if (/^https?:\/\/.*/.test(myProfile.website)) {
                  return myProfile.website;
                } else {
                  return `https://${myProfile.website}`;
                }
              })()}
              target="_blank"
            >
              {myProfile.website}
              <MdOutlineOpenInNew className="inline-block h-4 w-4 mb-[7.2px]" />
            </a>
          )}
          {myProfile.about && <MultiLineBody body={myProfile.about} />}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-bold">すみか</h2>
        {region && (
          <RegionContext.Provider value={region}>
            <MapWrapper />
          </RegionContext.Provider>
        )}
        <div>
          <p>{region?.countryName?.ja || "どこか…"}</p>
          {estimatedDeliveryTime && (
            <div className="space-x-2 flex">
              <p className="font-normal">かかる日数:</p>
              <p>{estimatedDeliveryTime}日</p>
            </div>
          )}
        </div>
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
