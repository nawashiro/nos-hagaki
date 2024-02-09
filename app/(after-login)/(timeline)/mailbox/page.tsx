"use client";
import { useEffect, useState } from "react";
import { NDKFilter } from "@nostr-dev-kit/ndk";
import Timeline from "@/components/Timeline";
import { NDKEventList } from "@/src/NDKEventList";
import { create } from "zustand";
import { FetchData } from "@/src/fetchData";

interface State {
  filter: NDKFilter;
  timeline: NDKEventList;
}

const useStore = create<State>((set) => ({
  filter: {},
  timeline: new NDKEventList(),
}));

export default function Mailbox() {
  const [moreLoadButtonValid, setMoreLoadButtonValid] = useState<boolean>(true);
  const { filter, timeline } = useStore();

  const fetchdata = new FetchData();

  //タイムライン取得
  const getEvent = async (filter: NDKFilter) => {
    if (filter) {
      setMoreLoadButtonValid(false);
      const kind0Set = await fetchdata.getNotes(filter);
      timeline.concat(kind0Set);
      setMoreLoadButtonValid(true);
      return await fetchdata.getPubkeysOfNotes(kind0Set);
    } else {
      return [];
    }
  };

  //さらに読み込むボタン押下時の処理
  const getMoreEvent = () => {
    getEvent({ ...filter, until: timeline.until });
  };

  useEffect(() => {
    const firstFetchData = async () => {
      //NIP-07によるユーザ情報取得
      const user = await fetchdata.getUser();

      //kind-10002取得
      await fetchdata.getExplicitRelayUrls(user.pubkey);

      let pubkeys: string[] = [];

      //kind-1取得
      if (timeline.eventList.size == 0) {
        const kind1Filter = {
          kinds: [1],
          limit: 10,
          "#p": [user.pubkey],
        };

        pubkeys = await getEvent(kind1Filter);

        useStore.setState({ filter: kind1Filter });
      }

      //kind-0取得
      await fetchdata.getProfile(pubkeys);

      //すみか情報を取得
      await fetchdata.getRegionsWrapper(pubkeys);
    };
    firstFetchData();
  }, []);

  return (
    <Timeline
      regions={fetchdata.regions}
      profiles={fetchdata.profiles}
      getMoreEvent={getMoreEvent}
      timeline={timeline}
      moreLoadButtonValid={moreLoadButtonValid}
    />
  );
}
