"use client";

import { FetchData } from "@/src/fetchData";
import { useRouter } from "next/navigation";
import { Fragment, useEffect } from "react";
import { MdOutlineOpenInNew } from "react-icons/md";
import { nip19 } from "nostr-tools";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import Link from "next/link";

export const MultiLineBody = ({
  body,
  pointerEventNone = false,
}: {
  body: string;
  pointerEventNone?: boolean;
}) => {
  const fetchdata = new FetchData();
  const router = useRouter();
  const urlPattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name and extension
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  const npubPattern = new RegExp("nostr:npub[a-z0-9]", "i");
  const notePattern = new RegExp("nostr:note[a-z0-9]", "i");

  useEffect(() => {
    const firstFetchData = async () => {
      //=====npubを検出=====

      let npubUrls = new Set<string>();
      body.split(/\n| /).map((fragment) => {
        if (npubPattern.test(fragment)) {
          const { data } = nip19.decode(fragment.slice(6));
          if (typeof data === "string")
            npubUrls = new Set<string>([...npubUrls, data]);
        }
      });

      if (npubUrls.size > 0) {
        //NIP-07によるユーザ情報取得
        let user;
        //try {
        //  if (!localStorage.getItem("login")) {
        //    throw new Error("未ログイン");
        //  }
        user = await fetchdata.getUser();
        //} catch {
        //  router.push("/");
        //  return;
        //}

        //kind-10002取得
        await fetchdata.getExplicitRelayUrls(user.pubkey);

        //kind-0取得
        await fetchdata.getProfile(Array.from(npubUrls));
      }
    };
    firstFetchData();
  }, []);

  //ユーザー名
  const UserName = ({ fragment }: { fragment: string }) => {
    const slicedFragment = fragment.slice(6);
    try {
      const { data } = nip19.decode(slicedFragment);

      if (typeof data !== "string") throw new Error("decode error");

      const profileEvent: NDKEvent | undefined = (() => {
        for (const value of fetchdata.profiles) {
          if (value.pubkey == data) {
            return value;
          }
        }
      })();
      const profile = profileEvent ? JSON.parse(profileEvent.content) : {};
      return (
        <Link
          href={`/author/${data}`}
          className="text-neutral-400 hover:text-neutral-300"
        >
          @{profile?.name || slicedFragment}
        </Link>
      );
    } catch {
      return <>{fragment}</>;
    }
  };

  //ノート
  const Note = ({ fragment }: { fragment: string }) => {
    const slicedFragment = fragment.slice(6);
    try {
      const { data } = nip19.decode(slicedFragment);

      if (typeof data !== "string") throw new Error("decode error");

      return (
        <Link
          href={`/post/${data}`}
          className="text-neutral-400 hover:text-neutral-300"
        >
          {slicedFragment.slice(0, 12)}
        </Link>
      );
    } catch {
      return <>{fragment}</>;
    }
  };

  const texts = body.split("\n").map((item, index) => {
    return (
      <p key={index}>
        {item.split(" ").map((fragment, fragmentIndex) => {
          if (urlPattern.test(fragment)) {
            return (
              <Fragment key={fragmentIndex}>
                <a
                  href={fragment}
                  target="_blank"
                  className="text-neutral-400 underline hover:text-neutral-300 break-all"
                >
                  {fragment}
                  <MdOutlineOpenInNew className="inline-block h-4 w-4 mb-[7.2px]" />
                </a>
                <> </>
              </Fragment>
            );
          } else if (npubPattern.test(fragment)) {
            return (
              <Fragment key={fragmentIndex}>
                <UserName fragment={fragment} />
                <> </>
              </Fragment>
            );
          } else if (notePattern.test(fragment)) {
            return (
              <Fragment key={fragmentIndex}>
                <Note fragment={fragment} />
                <> </>
              </Fragment>
            );
          } else {
            return (
              <Fragment key={fragmentIndex}>
                {fragment}
                <> </>
              </Fragment>
            );
          }
        })}
        <br />
      </p>
    );
  });
  return (
    <div
      className={`leading-9 break-words${
        pointerEventNone && " pointer-events-none"
      }`}
    >
      {texts}
    </div>
  );
};
