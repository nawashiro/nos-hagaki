import { NDKEvent } from "@nostr-dev-kit/ndk";
import EventCard from "./EventCard";

export default function Timeline({ timeline }: { timeline: NDKEvent[] }) {
  return (
    <div className="space-y-4">
      {timeline
        .sort((a, b) => {
          const dateA = a.created_at || 0;
          const dateB = b.created_at || 0;
          return dateB - dateA;
        })
        .map((event, index) => (
          <EventCard event={event} key={index} />
        ))}
    </div>
  );
}
