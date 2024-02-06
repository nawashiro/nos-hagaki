"use client";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import EventCard from "./EventCard";
import { NDKEventList } from "@/src/NDKEventList";
import MoreLoadButton from "./MoreLoadButton";
import { Region } from "@/src/getRegions";

export default function Timeline({
  regions,
  profiles,
  getMoreEvent,
  timeline,
  moreLoadButtonValid,
}: {
  regions: Region[];
  profiles: NDKEvent[];
  getMoreEvent: any;
  timeline: NDKEventList;
  moreLoadButtonValid: boolean;
}) {
  return (
    <div className="space-y-8">
      {moreLoadButtonValid ? (
        <div className="space-y-4">
          {Array.from(timeline.eventList)
            .sort((a, b) => {
              const dateA = a.created_at || 0;
              const dateB = b.created_at || 0;
              return dateB - dateA;
            })
            .map((event, index) => (
              <EventCard
                event={event}
                key={index}
                regions={regions}
                profiles={profiles}
              />
            ))}
        </div>
      ) : (
        <p className="text-center py-2">がんばってます…</p>
      )}
      <MoreLoadButton
        valid={moreLoadButtonValid && timeline.eventList.size != 0}
        onClick={getMoreEvent}
      />
    </div>
  );
}
