import { NDKEvent, NDKFilter } from "@nostr-dev-kit/ndk";
import EventCard from "./EventCard";
import { NDKEventList } from "@/src/NDKEventList";
import { useContext, useEffect, useState } from "react";
import { NDKContext } from "@/src/NDKContext";
import MoreLoadButton from "./MoreLoadButton";
import { getProfiles } from "@/src/getProfiles";

export default function Timeline({ filter }: { filter: NDKFilter }) {
  const [timeline, setTimeline] = useState<NDKEventList>(new NDKEventList());
  const ndk = useContext(NDKContext);
  const [moreLoadButtonValid, setMoreLoadButtonValid] =
    useState<boolean>(false);
  const [profiles, setProfiles] = useState(new Set<NDKEvent>());

  const getEvent = async (filter: NDKFilter) => {
    if (filter) {
      setMoreLoadButtonValid(false);
      setTimeline(timeline.concat(await ndk.fetchEvents(filter)));
      setProfiles(await getProfiles(ndk, filter.authors));
      setMoreLoadButtonValid(true);
    }
  };

  useEffect(() => {
    if (timeline.eventList.size <= 10) {
      getEvent(filter);
    }
  }, []);

  const getMoreEvent = () => {
    getEvent({ ...filter, until: timeline.until });
  };
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        {Array.from(timeline.eventList)
          .sort((a, b) => {
            const dateA = a.created_at || 0;
            const dateB = b.created_at || 0;
            return dateB - dateA;
          })
          .map((event, index) => (
            <EventCard event={event} key={index} profiles={profiles} />
          ))}
      </div>
      <MoreLoadButton valid={moreLoadButtonValid} onClick={getMoreEvent} />
    </div>
  );
}
