import { NDKEvent, NDKFilter, NDKUser } from "@nostr-dev-kit/ndk";
import { NDKSingleton } from "./NDKSingleton";

export const getFollows = async (ndk: NDKSingleton, user: NDKUser) => {
  const followsFilter: NDKFilter = {
    kinds: [3],
    authors: [user.pubkey],
  };

  const followsEvent: NDKEvent | null = await ndk.fetchEvent(followsFilter);

  if (!followsEvent) {
    throw "kind 3 is not found.";
  }

  let follows: string[] = [];
  for (const value of followsEvent.tags) {
    if (value[0] == "p") {
      follows = [...follows, value[1]];
    }
  }

  return follows;
};
