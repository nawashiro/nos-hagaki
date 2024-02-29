"use client";
import IconWithPostmark from "@/components/iconWithPostmark";
import { MultiLineBody } from "@/components/multiLineBody";
import { FetchData } from "@/src/fetchData";
import { Region } from "@/src/getRegions";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { nip19 } from "nostr-tools";
import { useEffect, useState } from "react";

export default function Post({ params }: { params: { id: string } }) {
  const [region, setRegion] = useState<Region>();
  const [kind1Event, setKind1Event] = useState<NDKEvent>();
  const [profile, setProfile] = useState<any>({});

  const fetchdata = new FetchData();
  const router = useRouter();

  useEffect(() => {
    const firstFetchData = async () => {
      //NIP-07によるユーザ情報取得
      let user;
      try {
        if (!localStorage.getItem("login")) {
          throw new Error("未ログイン");
        }
        user = await fetchdata.getUser();
      } catch {
        router.push("/");
        return;
      }

      //kind-10002取得
      await fetchdata.getExplicitRelayUrls(user.pubkey);

      //kind-1取得
      const newKind1Event = await fetchdata.getAloneNote(params.id);

      if (!newKind1Event) {
        return;
      }

      setKind1Event(newKind1Event);

      //kind-0取得
      const newProfile = await fetchdata.getAloneProfile(newKind1Event.pubkey);
      setProfile(newProfile ? JSON.parse(newProfile.content) : {});

      //すみか情報取得
      const newRegion = await fetchdata.getAloneRegion(newKind1Event.pubkey);
      setRegion(newRegion);
    };

    firstFetchData();
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
            <div className="">
              <Link
                href={`/author/${kind1Event.pubkey}`}
                className="flex w-fit space-x-2"
              >
                {profile.display_name && (
                  <p className="font-bold">{profile.display_name}</p>
                )}
                <p className="text-neutral-500 break-all">
                  @{profile.name || nip19.npubEncode(kind1Event.pubkey)}
                </p>
              </Link>
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
