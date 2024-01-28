"use client";
import { useContext, useEffect, useState } from "react";
import { NDKContext } from "@/src/NDKContext";
import { getExplicitRelayUrls } from "@/src/getExplicitRelayUrls";
import { NDKFilter, NDKNip07Signer } from "@nostr-dev-kit/ndk";
import { getFollows } from "@/src/getFollows";
import Timeline from "@/components/Timeline";
import { Region, getRegions } from "@/src/getRegions";

export default function Mailbox() {
  const ndk = useContext(NDKContext);
  const [filter, setFilter] = useState<NDKFilter>();
  const [regions, setRegions] = useState<Region[]>([]);

  useEffect(() => {
    const fetchdata = async () => {
      const nip07signer = new NDKNip07Signer();
      const user = await nip07signer.user();

      if (!user.pubkey) {
        throw new Error("pubkey is false");
      }

      await getExplicitRelayUrls(ndk, user);

      const follows = await getFollows(ndk, user);
      setFilter({
        kinds: [1],
        authors: follows,
        limit: 10,
      });

      setRegions(await getRegions(follows));
    };
    fetchdata();
  }, []);

  return filter && <Timeline filter={filter} regions={regions} />;
}
