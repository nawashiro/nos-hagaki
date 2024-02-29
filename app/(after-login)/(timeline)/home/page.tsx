"use client";
import DivCard from "@/components/divCard";
import SimpleButton from "@/components/simpleButton";
import Link from "next/link";
import { useEffect, useState } from "react";
import { RegionContext } from "@/src/context";
import { NDKFilter } from "@nostr-dev-kit/ndk";
import Timeline from "@/components/Timeline";
import { Region } from "@/src/getRegions";
import MapWrapper from "@/components/mapWrapper";
import { NDKEventList } from "@/src/NDKEventList";
import { create } from "zustand";
import { MdOutlineOpenInNew, MdOutlineQrCode } from "react-icons/md";
import ProfileIcon from "@/components/profileIcon";
import { FetchData } from "@/src/fetchData";
import { useRouter } from "next/navigation";
import { MultiLineBody } from "@/components/multiLineBody";
import IdScanAndCopyDialog from "@/components/idScanAndCopyDialog";
import { nip19 } from "nostr-tools";

interface State {
  filter: NDKFilter;
  myProfile: any;
  timeline: NDKEventList;
  region: Region | undefined;
}

const useStore = create<State>((set) => ({
  filter: {},
  myProfile: {},
  timeline: new NDKEventList(),
  region: undefined,
}));

export default function Home() {
  const [messageReaded, setMessageReaded] = useState<boolean>(true); //ログイン時メッセージ表示可否
  const [moreLoadButtonValid, setMoreLoadButtonValid] = useState<boolean>(true);
  const { filter, myProfile, timeline, region } = useStore();
  const [privacyPolicyChanged, setPrivacyPolicyChanged] =
    useState<boolean>(false);
  const [termsOfUseChanged, setTermsOfUseChanged] = useState<boolean>(false);
  const [npub, setNpub] = useState<string>("");
  const [dialogViewFlag, setDialogViewFlag] = useState<boolean>(false);

  const fetchdata = new FetchData();
  const router = useRouter();

  //タイムライン取得
  const getEvent = async (filter: NDKFilter) => {
    if (filter) {
      setMoreLoadButtonValid(false);
      timeline.concat(await fetchdata.getNotes(filter));
      setMoreLoadButtonValid(true);
    }
  };

  //さらに読み込むボタン押下時の処理
  const getMoreEvent = () => {
    getEvent({ ...filter, until: timeline.until });
  };

  useEffect(() => {
    const fitstFetchdata = async () => {
      //プライバシーポリシー告知
      const privacyPolicyChangeDay = process.env
        .NEXT_PUBLIC_PRIVACY_POLICY_CHANGED
        ? new Date(process.env.NEXT_PUBLIC_PRIVACY_POLICY_CHANGED)
        : new Date();

      const privacyPolicyAgreeDateString = localStorage.getItem(
        "privacy-policy-agree-date"
      );

      const privacyPolicyAgreeDate = privacyPolicyAgreeDateString
        ? new Date(privacyPolicyAgreeDateString)
        : new Date(0);

      setPrivacyPolicyChanged(privacyPolicyChangeDay >= privacyPolicyAgreeDate);

      //利用規約告知
      const termsOfUseChangeDay = process.env.NEXT_PUBLIC_TEAMS_OF_USE_CHANGED
        ? new Date(process.env.NEXT_PUBLIC_TEAMS_OF_USE_CHANGED)
        : new Date();

      const termsOfUseChangeDayString = localStorage.getItem(
        "terms-of-use-agree-date"
      );

      const termsOfUseChangeDayAgreeDate = termsOfUseChangeDayString
        ? new Date(termsOfUseChangeDayString)
        : new Date(0);

      setTermsOfUseChanged(termsOfUseChangeDay >= termsOfUseChangeDayAgreeDate);

      //NIP-07によるユーザ情報取得
      let user;
      try {
        if (!localStorage.getItem("login")) {
          throw new Error("未ログイン");
        }
        user = await fetchdata.getUser();
        setNpub(nip19.npubEncode(user.pubkey));
      } catch {
        router.push("/");
        return;
      }

      //すみか情報取得
      useStore.setState({
        region: await fetchdata.getAloneRegion(user.pubkey),
      });

      //kind-10002取得
      await fetchdata.getExplicitRelayUrls(user.pubkey);

      //kind-0取得
      const newMyProfile = await fetchdata.getAloneProfile(user.pubkey);

      useStore.setState({
        myProfile: newMyProfile ? JSON.parse(newMyProfile.content) : {},
      });

      //kind-1取得
      const kind1Filter: NDKFilter = {
        kinds: [1],
        authors: [user.pubkey],
        limit: 10,
      };

      if (timeline.eventList.size == 0) {
        await getEvent(kind1Filter);
      }

      useStore.setState({ filter: kind1Filter });
    };
    setMessageReaded(localStorage.getItem("messageReaded") == "true");
    fitstFetchdata();
  }, []);

  return (
    <>
      <IdScanAndCopyDialog
        dialogViewFlag={dialogViewFlag}
        npub={npub}
        onClick={() => {
          setDialogViewFlag(false);
        }}
      />
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
                href={"/help"}
                className="block px-4 py-2 text-neutral-500 outline-2 outline outline-neutral-200 rounded-[2rem] hover:bg-neutral-200"
              >
                ヘルプを見る
              </Link>
            </div>
          </DivCard>
        )}

        {privacyPolicyChanged && (
          <DivCard>
            <p>
              プライバシーポリシーが変更されたわ。
              <br />
              しっかりと確認しておくこと！
            </p>
            <SimpleButton
              onClick={() => {
                localStorage.setItem(
                  "privacy-policy-agree-date",
                  new Date().toISOString()
                );
                setPrivacyPolicyChanged(false);
                router.push("/privacy-policy");
              }}
            >
              プライバシーポリシーを見る
            </SimpleButton>
          </DivCard>
        )}

        {termsOfUseChanged && (
          <DivCard>
            <p>
              利用規約が変更されたわ。
              <br />
              しっかりと確認しておくこと！
            </p>
            <SimpleButton
              onClick={() => {
                localStorage.setItem(
                  "terms-of-use-agree-date",
                  new Date().toISOString()
                );
                setTermsOfUseChanged(false);
                router.push("/terms-of-use");
              }}
            >
              利用規約を見る
            </SimpleButton>
          </DivCard>
        )}

        <div className="space-y-4">
          <div className="flex">
            <ProfileIcon picture={myProfile.picture} />
            <div className="flex ml-auto space-x-2 items-start">
              <button
                onClick={() => {
                  setDialogViewFlag(true);
                }}
                className="flex rounded-lg space-x-1 p-1 hover:bg-neutral-200"
              >
                <MdOutlineQrCode className="h-8 w-8" />
              </button>
            </div>
          </div>
          <div>
            {myProfile.display_name && (
              <p className="font-bold">{myProfile.display_name}</p>
            )}
            {fetchdata.user && (
              <p className="text-neutral-500 break-all">
                @{myProfile.name || fetchdata.user.npub}
              </p>
            )}
          </div>

          <div>
            {myProfile.website && (
              <>
                <a
                  className="break-words text-neutral-400 underline hover:text-neutral-300"
                  href={(() => {
                    if (/^https?:\/\/.*/.test(myProfile.website)) {
                      return myProfile.website;
                    } else {
                      return `https://${myProfile.website}`;
                    }
                  })()}
                  target="_blank"
                >
                  {myProfile.website}
                  <MdOutlineOpenInNew className="inline-block h-4 w-4 mb-[7.2px]" />
                </a>
              </>
            )}
            {myProfile.about && (
              <MultiLineBody body={myProfile.about} smallLeading={true} />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-bold">あなたのすみか</h2>
          {region && (
            <RegionContext.Provider value={region}>
              <MapWrapper />
            </RegionContext.Provider>
          )}
          <p>{region?.countryName?.ja || "どこか…"}</p>
        </div>

        <Timeline
          regions={fetchdata.regions}
          profiles={fetchdata.profiles}
          getMoreEvent={getMoreEvent}
          timeline={timeline}
          moreLoadButtonValid={moreLoadButtonValid}
        />
      </div>
    </>
  );
}
