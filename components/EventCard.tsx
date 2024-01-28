import { NDKEvent } from "@nostr-dev-kit/ndk";
import Link from "next/link";
import Image from "next/image";

export default function EventCard({
  event,
  profiles,
}: {
  event: NDKEvent;
  profiles: Set<NDKEvent>;
}) {
  const profileEvent: NDKEvent | undefined = (() => {
    for (const value of profiles) {
      if (value.pubkey == event.pubkey) {
        return value;
      }
    }
  })();

  if (!profileEvent) {
    throw new Error("kind 0 is not found.");
  }

  const profile = JSON.parse(profileEvent.content);

  const created_at = event.created_at || 0;
  const dateTime = new Date(created_at * 1000);

  return (
    <Link
      href={`/post/${event.id}`}
      className="block w-full p-4 rounded-2xl border-2 border-neutral-200 space-y-4 hover:bg-neutral-200"
    >
      <div className="flex">
        {profile.picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.picture}
            alt={"avater picture"}
            width={64}
            height={64}
            loading="lazy"
            className="rounded-2xl bg-neutral-200"
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
        <p className="ml-auto text-neutral-500">{event.content.length}文字</p>
      </div>

      <p className="line-clamp-2">{event.content}</p>

      <div>
        <div className="flex space-x-2">
          <p className="font-bold">{profile.display_name || ""}</p>
          <p className="text-neutral-500">@{profile.name}</p>
        </div>
        <p className="text-neutral-500">{dateTime.toLocaleDateString()}</p>
      </div>
    </Link>
  );
}
