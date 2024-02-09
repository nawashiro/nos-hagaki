"use client";
import Image from "next/image";

export default function ProfileIcon({ picture }: { picture: string }) {
  return picture ? (
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
  );
}
