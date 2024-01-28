import { NDKEvent, NDKFilter } from "@nostr-dev-kit/ndk";
import { NDKSingleton } from "./NDKSingleton";

export const getProfiles = async (ndk: NDKSingleton, users: string[]) => {
  const filter: NDKFilter = {
    kinds: [0],
    authors: users,
  };

  const profileEvents: Set<NDKEvent> = await ndk.fetchEvents(filter);

  if (!profileEvents) {
    throw "kind 0 is not found.";
  }

  return profileEvents;
};
