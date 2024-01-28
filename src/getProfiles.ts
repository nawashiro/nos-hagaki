import { NDKEvent, NDKFilter } from "@nostr-dev-kit/ndk";
import { NDKSingleton } from "./NDKSingleton";

export const getProfiles = async (
  ndk: NDKSingleton,
  users: string[] | undefined
) => {
  if (!users) {
    return new Set<NDKEvent>();
  }

  const filter: NDKFilter = {
    kinds: [0],
    authors: users,
  };

  const profileEvents: Set<NDKEvent> = await ndk.fetchEvents(filter);

  return profileEvents;
};
