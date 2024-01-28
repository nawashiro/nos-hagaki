"use client";
import { useContext, useEffect, useState } from "react";
import { NDKContext } from "@/src/NDKContext";
import { getExplicitRelayUrls } from "@/src/getExplicitRelayUrls";
import { NDKFilter, NDKNip07Signer } from "@nostr-dev-kit/ndk";
import { getFollows } from "@/src/getFollows";
import Timeline from "@/components/Timeline";

export default function Mailbox() {
  const ndk = useContext(NDKContext);
  const [filter, setFilter] = useState<NDKFilter>();

  useEffect(() => {
    const fetchdata = async () => {
      const nip07signer = new NDKNip07Signer();
      const user = await nip07signer.user();

      if (!user.pubkey) {
        throw new Error("pubkey is false");
      }

      await getExplicitRelayUrls(ndk, user);

      setFilter({
        kinds: [1],
        authors: await getFollows(ndk, user),
        limit: 10,
      });
    };
    fetchdata();
  }, []);

  return filter && <Timeline filter={filter} />;
}
