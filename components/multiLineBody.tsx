"use client";

import { FetchData } from "@/src/fetchData";
//import { useRouter } from "next/navigation";
import { Fragment, useEffect } from "react";
import { MdOutlineOpenInNew } from "react-icons/md";
import { nip19 } from "nostr-tools";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import Link from "next/link";

export const MultiLineBody = ({
  body,
  pointerEventNone = false,
  smallLeading = false,
}: {
  body: string;
  pointerEventNone?: boolean;
  smallLeading?: boolean;
}) => {
  const fetchdata = new FetchData();
  //const router = useRouter();
  const urlPattern = /^https?:\/\/[\w/:%#\$&\?\(\)~\.=\+\-]+/;
  const nip19Pattern = /^nostr:[a-z0-9]/;

  useEffect(() => {
    const firstFetchData = async () => {
      //=====npubを検出=====

      let npubUrls = new Set<string>();
      body.split(/\n| /).map((fragment) => {
        if (nip19Pattern.test(fragment)) {
          const { data, type } = nip19.decode(fragment.slice(6));
          let npub;
          if (type == "npub" || type == "nprofile") {
            if (type == "npub") {
              npub = data;
            } else {
              npub = data.pubkey;
            }
            npubUrls = new Set<string>([...npubUrls, npub]);
          }
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

  //ノート
  const Nip19 = ({ fragment }: { fragment: string }) => {
    const slicedFragment = fragment.replace("nostr:", "");

    try {
      const { data, type } = nip19.decode(slicedFragment);

      if (type == "note" || type == "nevent") {
        let id;
        if (type == "note") {
          id = data;
        } else if (type == "nevent") {
          id = data.id;
        }
        return (
          <Link
            href={`/post/${id}`}
            className="text-neutral-400 break-all hover:text-neutral-300"
          >
            {slicedFragment.slice(0, 12)}
          </Link>
        );
      } else if (type == "npub" || type == "nprofile") {
        let npub;
        if (type == "npub") {
          npub = data;
        } else {
          npub = data.pubkey;
        }

        const profileEvent: NDKEvent | undefined = (() => {
          for (const value of fetchdata.profiles) {
            if (value.pubkey == npub) {
              return value;
            }
          }
        })();
        const profile = profileEvent ? JSON.parse(profileEvent.content) : {};
        return (
          <Link
            href={`/author/${npub}`}
            className="text-neutral-400 break-all hover:text-neutral-300"
          >
            @{profile?.name || slicedFragment}
          </Link>
        );
      }
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
                  href={(() => {
                    if (RegExp("^(https|http)://.*").test(fragment)) {
                      return fragment;
                    } else {
                      return `https://${fragment}`;
                    }
                  })()}
                  target="_blank"
                  className="text-neutral-400 underline hover:text-neutral-300 break-all"
                >
                  {fragment}
                  <MdOutlineOpenInNew className="inline-block h-4 w-4 mb-[7.2px]" />
                </a>
                <> </>
              </Fragment>
            );
          } else if (nip19Pattern.test(fragment)) {
            return (
              <Fragment key={fragmentIndex}>
                <Nip19 fragment={fragment} />
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
      className={`break-words ${pointerEventNone && "pointer-events-none"} ${
        smallLeading || "leading-9"
      }`}
    >
      {texts}
    </div>
  );
};
