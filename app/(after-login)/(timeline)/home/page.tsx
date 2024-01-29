"use client";
import DivCard from "@/components/divCard";
import SimpleButton from "@/components/simpleButton";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { NDKContext, RegionContext } from "@/src/context";
import { getExplicitRelayUrls } from "@/src/getExplicitRelayUrls";
import { NDKEvent, NDKFilter, NDKNip07Signer } from "@nostr-dev-kit/ndk";
import Timeline from "@/components/Timeline";
import { Region, getRegions } from "@/src/getRegions";
import Image from "next/image";
import MapWrapper from "@/components/mapWrapper";
import { NDKEventList } from "@/src/NDKEventList";

export default function Home() {
  const [messageReaded, setMessageReaded] = useState<boolean>(true); //ログイン時メッセージ表示可否
  const ndk = useContext(NDKContext);
  const [filter, setFilter] = useState<NDKFilter>();
  const [regions, setRegions] = useState<Region[]>([]);
  const [myProfile, setMyProfile] = useState<any>({});
  const [profiles, setProfiles] = useState<NDKEvent[]>([]);
  const [pubkey, setPubkey] = useState<string>("");
  const [moreLoadButtonValid, setMoreLoadButtonValid] =
    useState<boolean>(false);
  const [timeline, setTimeline] = useState<NDKEventList>(new NDKEventList());

  //タイムライン取得
  const getEvent = async (filter: NDKFilter) => {
    if (filter) {
      setMoreLoadButtonValid(false);
      setTimeline(timeline.concat(await ndk.fetchEvents(filter)));
      setMoreLoadButtonValid(true);
    }
  };

  //さらに読み込むボタン押下時の処理
  const getMoreEvent = () => {
    getEvent({ ...filter, until: timeline.until });
  };

  useEffect(() => {
    const fetchdata = async () => {
      //NIP-07によるユーザ情報取得
      const nip07signer = new NDKNip07Signer();
      const user = await nip07signer.user();

      if (!user.pubkey) {
        throw new Error("pubkey is false");
      }

      setPubkey(user.pubkey);

      //すみか情報取得
      setRegions(await getRegions([user.pubkey]));

      //kind-10002取得
      await getExplicitRelayUrls(ndk, user);

      //kind-0取得
      const kind0Filter: NDKFilter = {
        kinds: [0],
        authors: [user.pubkey],
      };
      const newProfiles = await ndk.fetchEvents(kind0Filter);
      setProfiles(Array.from(newProfiles));

      const profileEvent = Array.from(newProfiles).find(
        (element) => element.pubkey == user.pubkey
      );
      setMyProfile(profileEvent ? JSON.parse(profileEvent.content) : {});

      //kind-1取得
      const kind1Filter: NDKFilter = {
        kinds: [1],
        authors: [user.pubkey],
        limit: 10,
      };

      if (timeline.eventList.size < 10) {
        await getEvent(kind1Filter);
      }

      setFilter(kind1Filter);
    };
    setMessageReaded(localStorage.getItem("messageReaded") == "true");
    fetchdata();
  }, []);

  return (
    <div className="space-y-8">
      {!messageReaded && (
        <DivCard>
          <p>
            おかえりなさい。あっ…いえ、初めましてかもしれないわね。
            <br />
            このアプリはWeb用のNostrクライアントよ。はがきを送りあうような操作感を目指しているの。
            <br />
            使い方はヘルプにまとめてあるし、右上からいつでも呼び出せるわ。
            <br />
            べっ、別にあんたのためじゃないんだからねっ！
          </p>
          <div className="flex space-x-4">
            <SimpleButton
              onClick={() => {
                localStorage.setItem("messageReaded", "true");
                setMessageReaded(true);
              }}
            >
              わかった
            </SimpleButton>
            <Link
              href={"#"}
              className="px-4 py-2 text-neutral-500 border-2 border-neutral-200 rounded-[2rem] hover:bg-neutral-200"
            >
              ヘルプを見る
            </Link>
          </div>
        </DivCard>
      )}

      <div className="space-y-4">
        {myProfile.picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={myProfile.picture}
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

        <div>
          {myProfile.display_name && (
            <p className="font-bold">{myProfile.display_name}</p>
          )}
          <p className="text-neutral-500 break-all">
            @{myProfile.name || pubkey}
          </p>
        </div>

        <div>
          {myProfile.website && (
            <a className="text-neutral-500" href={myProfile.website}>
              {myProfile.website}
            </a>
          )}
          {myProfile.about && <p>{myProfile.about}</p>}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-bold">あなたのすみか</h2>
        {regions && (
          <RegionContext.Provider value={regions[0]}>
            <MapWrapper />
          </RegionContext.Provider>
        )}
        <p>{regions[0]?.countryName?.ja || "どこか…"}</p>
      </div>

      <Timeline
        regions={regions}
        profiles={profiles}
        getMoreEvent={getMoreEvent}
        timeline={timeline}
        moreLoadButtonValid={moreLoadButtonValid}
      />
    </div>
  );
}
