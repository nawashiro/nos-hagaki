import { NDKFilter, NDKUser } from "@nostr-dev-kit/ndk";
import { NDKSingleton } from "./NDKSingleton";

export const GetExplicitRelayUrls = async (
  ndk: NDKSingleton,
  user: NDKUser
) => {
  if (ndk.explicitRelayUrls?.length == 0) {
    ndk.explicitRelayUrls = [
      "wss://nos.lol",
      "wss://relay.damus.io",
      "wss://relay-jp.nostr.wirednet.jp",
      "wss://nostr-relay.nokotaro.com",
      "wss://nostr.holybea.com",
      "wss://nostr.fediverse.jp",
      "wss://yabu.me",
    ];

    const explicitRelayUrlsFilter: NDKFilter = {
      kinds: [10002],
      authors: [user.pubkey],
    };

    const explicitRelayUrlsEvent: any = await ndk.fetchEvent(
      explicitRelayUrlsFilter
    );

    const explicitRelayUrls = [];
    for (const value of explicitRelayUrlsEvent.tags) {
      if (value[0] == "r") {
        explicitRelayUrls.push(value[1]);
      }
    }
    ndk.explicitRelayUrls = explicitRelayUrls;
  }
};
