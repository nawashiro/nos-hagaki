import { NDKEvent, NDKFilter } from "@nostr-dev-kit/ndk";
import { NDKSingleton } from "./NDKSingleton";

export const getProfiles = async (ndk: NDKSingleton, filter: NDKFilter) => {
  if (!filter) {
    return new Set<NDKEvent>();
  }

  filter.kinds = [0];

  const profileEvents: Set<NDKEvent> = await ndk.fetchEvents(filter);

  return profileEvents;
};
