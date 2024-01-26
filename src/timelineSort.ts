import { NDKEvent } from "@nostr-dev-kit/ndk";

export const timelineSort = (timeline: NDKEvent[]) => {
  return timeline.sort((a, b) => {
    const dateA = a.created_at || 0;
    const dateB = b.created_at || 0;
    return dateB - dateA;
  });
};
