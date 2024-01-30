"use client";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import Link from "next/link";
import { Region } from "@/src/getRegions";
import IconWithPostmark from "./iconWithPostmark";

export default function EventCard({
  event,
  regions,
  profiles,
}: {
  event: NDKEvent;
  regions: Region[];
  profiles: NDKEvent[];
}) {
  const profileEvent: NDKEvent | undefined = (() => {
    for (const value of profiles) {
      if (value.pubkey == event.pubkey) {
        return value;
      }
    }
  })();

  const region = regions.find((element) => element.pubkey == event.pubkey);
  const profile = profileEvent ? JSON.parse(profileEvent.content) : {};
  const created_at = event.created_at || 0;
  const dateTime = new Date(created_at * 1000);

  return (
    <>
      <Link
        href={{ pathname: `/post/${event.id}` }}
        className="relative block w-full p-4 rounded-2xl border-2 border-neutral-200 hover:bg-neutral-200"
      >
        <div className="space-y-4">
          <IconWithPostmark
            picture={profile.picture}
            iso={region?.countryName?.iso}
          />

          <p className="line-clamp-2 break-words">{event.content}</p>

          <div>
            <div className="flex space-x-2">
              {profile.display_name && (
                <p className="font-bold">{profile.display_name}</p>
              )}
              <p className="text-neutral-500 break-all">
                @{profile.name || event.pubkey}
              </p>
            </div>
            <p className="text-neutral-500">{dateTime.toLocaleDateString()}</p>
            <p className="text-neutral-500">
              {region?.countryName?.ja || "どこか…"}
            </p>
          </div>
        </div>
        <p className="absolute text-neutral-500 top-4 right-4">
          {event.content.length}文字
        </p>
      </Link>
    </>
  );
}
