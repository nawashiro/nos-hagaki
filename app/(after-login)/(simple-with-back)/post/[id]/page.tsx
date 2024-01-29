"use client";
import IconWithPostmark from "@/components/iconWithPostmark";
import { MultiLineBody } from "@/components/multiLineBody";
import { NDKContext } from "@/src/context";
import { getExplicitRelayUrls } from "@/src/getExplicitRelayUrls";
import { Region, getRegions } from "@/src/getRegions";
import { NDKEvent, NDKFilter, NDKNip07Signer } from "@nostr-dev-kit/ndk";
import { useContext, useEffect, useState } from "react";

export default function Post({ params }: { params: { id: string } }) {
  const ndk = useContext(NDKContext);
  const [region, setRegion] = useState<Region>();
  const [kind1Event, setKind1Event] = useState<NDKEvent>();
  const [profile, setProfile] = useState<any>({});

  useEffect(() => {
    const fetchdata = async () => {
      //NIP-07によるユーザ情報取得
      const nip07signer = new NDKNip07Signer();
      const user = await nip07signer.user();

      if (!user.pubkey) {
        throw new Error("pubkey is false");
      }

      //kind-10002取得
      await getExplicitRelayUrls(ndk, user);

      //kind-1取得
      const kind1Filter: NDKFilter = {
        kinds: [1],
        ids: [params.id],
        limit: 1,
      };

      const newKind1Event: NDKEvent | undefined =
        (await ndk.fetchEvent(kind1Filter)) || undefined;
      setKind1Event(newKind1Event);

      if (!newKind1Event) {
        return;
      }

      //kind-0取得
      const kind0Filter: NDKFilter = {
        kinds: [0],
        authors: [newKind1Event.pubkey],
      };
      const newProfile = await ndk.fetchEvent(kind0Filter);
      setProfile(newProfile ? JSON.parse(newProfile.content) : {});

      //すみか情報取得
      setRegion((await getRegions([newKind1Event.pubkey]))[0]);
    };
    fetchdata();
  }, []);
  return (
    <div className="space-y-8">
      <IconWithPostmark
        picture={profile.picture}
        iso={region?.countryName?.iso}
      />
      {kind1Event ? (
        <>
          <MultiLineBody body={kind1Event?.content} />

          <div>
            <div className="flex space-x-2">
              {profile.display_name && (
                <p className="font-bold">{profile.display_name}</p>
              )}
              <p className="text-neutral-500 break-all">
                @{profile.name || kind1Event.pubkey}
              </p>
            </div>
            <p className="text-neutral-500">
              {kind1Event.created_at &&
                new Date(kind1Event.created_at * 1000).toLocaleDateString()}
            </p>
            <p className="text-neutral-500">
              {region?.countryName?.ja || "どこか…"}
            </p>
          </div>
        </>
      ) : (
        <p className="text-center">がんばってます…</p>
      )}
    </div>
  );
}
