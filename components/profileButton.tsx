"use client";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { Region } from "@/src/getRegions";
import ProfileIcon from "./profileIcon";
import { ButtonHTMLAttributes, MouseEventHandler } from "react";

export default function ProfileButton({
  pubkey,
  regions,
  profiles,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  pubkey: string;
  regions: Region[];
  profiles: NDKEvent[];
}) {
  const profileEvent: NDKEvent | undefined = (() => {
    for (const value of profiles) {
      if (value.pubkey == pubkey) {
        return value;
      }
    }
  })();

  const region = regions.find((element) => element.pubkey == pubkey);
  const profile = profileEvent ? JSON.parse(profileEvent.content) : {};

  return (
    <>
      <button
        className="w-full p-4 rounded-2xl outline-2 outline outline-neutral-200 hover:bg-neutral-200"
        {...props}
      >
        <div className="space-y-4">
          <ProfileIcon picture={profile.picture} />
          <div>
            <div className="flex space-x-2">
              {profile.display_name && (
                <p className="font-bold">{profile.display_name}</p>
              )}
              <p className="text-neutral-500 break-all">
                @{profile.name || pubkey}
              </p>
            </div>
            <p className="text-neutral-500 text-left">
              {region?.countryName?.ja || "どこか…"}
            </p>
          </div>
        </div>
      </button>
    </>
  );
}
