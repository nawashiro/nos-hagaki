"use client";
import Image from "next/image";

export default function IconWithPostmark({
  picture,
  iso,
}: {
  picture: string;
  iso: string | undefined;
}) {
  return (
    <div className="relative">
      {picture ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={picture}
          alt={"avater picture"}
          width={64}
          height={64}
          loading="lazy"
          className="h-16 w-16 object-cover rounded-2xl bg-neutral-200"
        />
      ) : (
        <Image
          src="/img/default_icon.webp"
          alt="avater picture"
          width={64}
          height={64}
          className="rounded-2xl"
        />
      )}
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
