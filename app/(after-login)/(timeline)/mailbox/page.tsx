"use client";
import { useContext, useEffect, useState } from "react";
import { NDKContext } from "@/src/NDKContext";
import { getExplicitRelayUrls } from "@/src/getExplicitRelayUrls";
import { NDKEvent, NDKFilter, NDKNip07Signer } from "@nostr-dev-kit/ndk";
import { NDKEventList } from "@/src/NDKEventList";
import { getFollows } from "@/src/getFollows";
import MoreLoadButton from "@/components/MoreLoadButton";
import Timeline from "@/components/Timeline";

const timelineEventList = new NDKEventList([]);
let followsList: string[] = [];

export default function Mailbox() {
  const [timeline, setTimeline] = useState<NDKEvent[]>([
    ...timelineEventList.eventList,
  ]);
  const [follows, setFollows] = useState<string[]>(followsList);
  const ndk = useContext(NDKContext);

  const getEvent = (filter: NDKFilter) => {
    const sub = ndk.subscribe(filter, { closeOnEose: true });
    sub.on("event", (event: NDKEvent) => {
      timelineEventList.push(event);
      setTimeline(timelineEventList.eventList);
    });
  };

  useEffect(() => {
    const fetchdata = async () => {
      const nip07signer = new NDKNip07Signer();
      const user = await nip07signer.user();

      if (!user.pubkey) {
        throw new Error("pubkey is false");
      }

      await getExplicitRelayUrls(ndk, user);

      if (followsList.length == 0) {
        followsList = await getFollows(ndk, user);
      }

      if (timeline.length <= 10) {
        const myKind1Filter: NDKFilter = {
          kinds: [1],
          authors: followsList,
          limit: 10,
        };
        getEvent(myKind1Filter);
      }

      setFollows(followsList);
    };
    fetchdata();
  }, []);

  const getMoreEvent = () => {
    const myKind1Filter: NDKFilter = {
      kinds: [1],
      authors: follows,
      limit: 10,
      until: timelineEventList.until,
    };
    getEvent(myKind1Filter);
  };

  return (
    <div className="space-y-8">
      <Timeline timeline={timeline} />
      <MoreLoadButton onClick={getMoreEvent} />
    </div>
  );
}
