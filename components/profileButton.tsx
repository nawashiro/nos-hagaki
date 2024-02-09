"use client";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import ProfileIcon from "./profileIcon";
import { ButtonHTMLAttributes, useEffect, useState } from "react";
import { FetchData } from "@/src/fetchData";

export default function ProfileButton({
  pubkey,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  pubkey: string;
}) {
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState<number>();
  const fetchdata = new FetchData();

  useEffect(() => {
    const firstFetchdata = async () => {
      const user = await fetchdata.getUser();
      setEstimatedDeliveryTime(
        await fetchdata.getEstimatedDeliveryTime(user.pubkey, pubkey)
      );
    };
    firstFetchdata();
  }, []);

  const profileEvent: NDKEvent | undefined = (() => {
    for (const value of fetchdata.profiles) {
      if (value.pubkey == pubkey) {
        return value;
      }
    }
  })();

  const region = fetchdata.regions.find((element) => element.pubkey == pubkey);
  const profile = profileEvent ? JSON.parse(profileEvent.content) : {};

  return (
    <>
      <button
        className="w-full p-4 rounded-2xl outline-2 outline outline-neutral-200 hover:bg-neutral-200"
        {...props}
      >
        <div className="space-y-4 text-left">
          <ProfileIcon picture={profile.picture} />

          <div>
            {profile.display_name && (
              <p className="font-bold">{profile.display_name}</p>
            )}
            <p className="text-neutral-500 break-all">
              @{profile.name || pubkey}
            </p>
          </div>
          <div className="text-neutral-500 ">
            <p>{region?.countryName?.ja || "どこか…"}</p>
            <div className="space-x-2 flex">
              <p className="font-normal">かかる日数:</p>
              <p>{estimatedDeliveryTime || "…"}日</p>
            </div>
          </div>
        </div>
      </button>
    </>
  );
}
