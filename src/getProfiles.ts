import { NDKEvent, NDKFilter } from "@nostr-dev-kit/ndk";
import { NDKSingleton } from "./NDKSingleton";

export const getProfiles = async (
  ndk: NDKSingleton,
  users: string[] | undefined
) => {
  if (!users) {
    throw new Error("There are 0 users.");
  }

  const filter: NDKFilter = {
    kinds: [0],
    authors: users,
  };

  const profileEvents: Set<NDKEvent> = await ndk.fetchEvents(filter);

  console.log(profileEvents);

  if (profileEvents.size == 0) {
    throw new Error("kind 0 is not found.");
  }

  return profileEvents;
};
