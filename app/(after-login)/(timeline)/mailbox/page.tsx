"use client";
import { useContext, useEffect, useState } from "react";
import { NDKContext } from "@/src/context";
import { getExplicitRelayUrls } from "@/src/getExplicitRelayUrls";
import { NDKEvent, NDKFilter, NDKNip07Signer } from "@nostr-dev-kit/ndk";
import { getFollows } from "@/src/getFollows";
import Timeline from "@/components/Timeline";
import { Region, getRegions } from "@/src/getRegions";
import { NDKEventList } from "@/src/NDKEventList";

export default function Mailbox() {
  const ndk = useContext(NDKContext);
  const [filter, setFilter] = useState<NDKFilter>();
  const [regions, setRegions] = useState<Region[]>([]);
  const [profiles, setProfiles] = useState<NDKEvent[]>([]);
  const [moreLoadButtonValid, setMoreLoadButtonValid] =
    useState<boolean>(false);
  const [timeline, setTimeline] = useState<NDKEventList>(new NDKEventList());

  //タイムライン取得
  const getEvent = async (filter: NDKFilter) => {
    if (filter) {
      setMoreLoadButtonValid(false);
      setTimeline(timeline.concat(await ndk.fetchEvents(filter)));
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
      const follows = await getFollows(ndk, user);

      //kind-0取得
      const kind0Filter: NDKFilter = {
        kinds: [0],
        authors: follows,
      };
      setProfiles(Array.from(await ndk.fetchEvents(kind0Filter)));

      //kind-1取得
      const kind1Filter = {
        kinds: [1],
        authors: follows,
        limit: 10,
      };

      if (timeline.eventList.size < 10) {
        await getEvent(kind1Filter);
      }

      setFilter(kind1Filter);

      //すみか情報を取得
      setRegions(await getRegions(follows));
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
