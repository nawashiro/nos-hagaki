"use client";
import { useContext, useEffect, useState } from "react";
import { NDKContext, ProfileContext } from "@/src/context";
import { getExplicitRelayUrls } from "@/src/getExplicitRelayUrls";
import { NDKEvent, NDKFilter, NDKNip07Signer } from "@nostr-dev-kit/ndk";
import { getFollows } from "@/src/getFollows";
import Timeline from "@/components/Timeline";
import { Region, getRegions } from "@/src/getRegions";

export default function Mailbox() {
  const ndk = useContext(NDKContext);
  const [filter, setFilter] = useState<NDKFilter>();
  const [regions, setRegions] = useState<Region[]>([]);
  const [profiles, setProfiles] = useState<NDKEvent[]>([]);

  useEffect(() => {
    const fetchdata = async () => {
      const nip07signer = new NDKNip07Signer();
      const user = await nip07signer.user();

      if (!user.pubkey) {
        throw new Error("pubkey is false");
      }

      await getExplicitRelayUrls(ndk, user);

      const follows = await getFollows(ndk, user);

      const kind1Filter = {
        kinds: [1],
        authors: follows,
        limit: 10,
      };

      const kind0Filter: NDKFilter = {
        kinds: [0],
        authors: follows,
      };

      setProfiles(Array.from(await ndk.fetchEvents(kind0Filter)));
      setFilter(kind1Filter);
      setRegions(await getRegions(follows));
    };
    fetchdata();
  }, []);

  return (
    filter && (
      <ProfileContext.Provider value={profiles}>
        <Timeline filter={filter} regions={regions} />
      </ProfileContext.Provider>
    )
  );
}
