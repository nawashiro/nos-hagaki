"use client";
import { useContext, useEffect, useState } from "react";
import { NDKContext } from "@/src/context";
import { getExplicitRelayUrls } from "@/src/getExplicitRelayUrls";
import { NDKEvent, NDKFilter, NDKNip07Signer } from "@nostr-dev-kit/ndk";
import { getFollows } from "@/src/getFollows";
import Timeline from "@/components/Timeline";
import { Region, getRegions } from "@/src/getRegions";
import { NDKEventList } from "@/src/NDKEventList";
import { create } from "zustand";

interface State {
  filter: NDKFilter;
  regions: Region[];
  profiles: NDKEvent[];
  timeline: NDKEventList;
}

const useStore = create<State>((set) => ({
  filter: {},
  regions: [],
  profiles: [],
  timeline: new NDKEventList(),
}));

export default function Mailbox() {
  const ndk = useContext(NDKContext);
  const [moreLoadButtonValid, setMoreLoadButtonValid] = useState<boolean>(true);
  const { filter, regions, profiles, timeline } = useStore();

  //タイムライン取得
  const getEvent = async (filter: NDKFilter) => {
    if (filter) {
      setMoreLoadButtonValid(false);
      useStore.setState({
        timeline: timeline.concat(await ndk.fetchEvents(filter)),
      });
      setMoreLoadButtonValid(true);
    }
  };

  //さらに読み込むボタン押下時の処理
  const getMoreEvent = () => {
    getEvent({ ...filter, until: timeline.until });
  };

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

      //kind-3取得
      if (
        profiles.length == 0 &&
        timeline.eventList.size == 0 &&
        regions.length == 0
      ) {
        const follows = await getFollows(ndk, user);

        //kind-0取得
        if (profiles.length == 0) {
          const kind0Filter: NDKFilter = {
            kinds: [0],
            authors: follows,
          };
          useStore.setState({
            profiles: Array.from(await ndk.fetchEvents(kind0Filter)),
          });
        }

        //kind-1取得
        if (timeline.eventList.size == 0) {
          const kind1Filter = {
            kinds: [1],
            authors: follows,
            limit: 10,
          };

          if (timeline.eventList.size < 10) {
            await getEvent(kind1Filter);
          }

          useStore.setState({ filter: kind1Filter });
        }

        //すみか情報を取得
        if (regions.length == 0) {
          useStore.setState({ regions: await getRegions(follows) });
        }
      }
    };
    fetchdata();
  }, []);

  return (
    <Timeline
      regions={regions}
      profiles={profiles}
      getMoreEvent={getMoreEvent}
      timeline={timeline}
      moreLoadButtonValid={moreLoadButtonValid}
    />
  );
}
