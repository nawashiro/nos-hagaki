"use client";
import Image from "next/image";
import ProfileIcon from "./profileIcon";

export default function IconWithPostmark({
  picture,
  iso,
}: {
  picture: string;
  iso: string | undefined;
}) {
  return (
    <div className="relative">
      <ProfileIcon picture={picture} />
      <Image
        src={"/img/postmark.webp"}
        height={64}
        width={93}
        alt="postmark"
        className="absolute top-0 left-12"
      />
      <p className="absolute font-medium text-sm w-[20px] text-center top-[21px] left-[70px] text-[#c30c08]">
        {iso || "…"}
      </p>
    </div>
  );
}
