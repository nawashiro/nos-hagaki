"use client";

import Dialog from "@/components/dialog";
import HeaderButton from "@/components/headerButton";
import { MultiLineBody } from "@/components/multiLineBody";
import Notice from "@/components/notice";
import SimpleButton from "@/components/simpleButton";
import { FetchData } from "@/src/fetchData";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { nip19 } from "nostr-tools";
import { useEffect, useRef, useState } from "react";
import { MdCheck } from "react-icons/md";

export default function Draft() {
  const [textContent, setTextContent] = useState<string>();
  const textarea = useRef<HTMLTextAreaElement>(null);
  const [timestamp, setTimestamp] = useState(Date.now());
  const timer = useRef<NodeJS.Timeout | null>(null);
  const [saved, setSaved] = useState<boolean>(true);
  const [dialogViewFlag, setDialogViewFlag] = useState<boolean>(false);
  const [addressProfile, setAddressProfile] = useState<any>();
  const fetchdata = new FetchData();
  const route = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [addresProfileEvent, setAddressProfileEvent] = useState<NDKEvent>();
  const router = useRouter();

  const saveText = () => {
    if (textContent !== undefined) {
      localStorage.setItem("draft-text", textContent);
      setSaved(true);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    // textareaの値を更新
    setTextContent(event.target.value);

    // タイムスタンプを更新
    setTimestamp(Date.now());

    // タイマーがセットされていたらクリアする
    if (timer.current) {
      clearTimeout(timer.current);
    }

    //保存状態をfalseに
    setSaved(false);
  };

  useEffect(() => {
    // 3秒後に保存するためのタイマーをセットする
    timer.current = setTimeout(() => {
      saveText();
    }, 2000);

    // コンポーネントがアンマウントされたときにタイマーをクリアする
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [timestamp]);

  useEffect(() => {
    const firstFetchData = async () => {
      //NIP-07によるユーザ情報取得
      let user;
      try {
        if (!localStorage.getItem("login")) {
          throw new Error("未ログイン");
        }
        user = await fetchdata.getUser();
      } catch {
        router.push("/");
        return;
      }

      //kind-10002取得
      await fetchdata.getExplicitRelayUrls(user.pubkey);

      //kind-0取得
      const addressNpub = localStorage.getItem("address-pubkey");
      if (addressNpub) {
        const newProfile = await fetchdata.getAloneProfile(addressNpub);
        newProfile && setAddressProfileEvent(newProfile);
        setAddressProfile(newProfile ? JSON.parse(newProfile.content) : {});
      }
    };

    setDialogViewFlag(localStorage.getItem("notice-dialog-accepted") != "true");
    const savedText = localStorage.getItem("draft-text");
    setTextContent(savedText || "");
    firstFetchData();
  }, []);

  useEffect(() => {
    changeTextareaHeight();
  }, [textContent]);

  const changeTextareaHeight = () => {
    if (textarea.current) {
      textarea.current.style.height = "auto";
      textarea.current.style.height = textarea.current.scrollHeight + "px";
    }
  };

  //save&confirm
  const toConfirm = () => {
    saveText();
    if (!localStorage.getItem("draft-text")) {
      setErrorMessage(
        "本文の記述が無いわ。伝えたいことを書いてから、また来なさいよね！"
      );
    } else if (!localStorage.getItem("address-pubkey")) {
      setErrorMessage(
        "お届け先の指定が無いわ。「お届け先を選ぶ…」で選んでから、また来なさいよね！"
      );
    } else {
      route.push("./confirm");
    }
  };

  return (
    <>
      <Dialog valid={dialogViewFlag}>
        <div className="space-y-4">
          <h2 className="font-bold">ご注意</h2>
          <p>大事なことが3つあるわ。操作を始める前に読んでおいてよね！</p>
        </div>
        <Notice />
        <p>わかった？なら「同意する」を押してもいいんじゃない？</p>
        <SimpleButton
          onClick={() => {
            setDialogViewFlag(false);
            localStorage.setItem("notice-dialog-accepted", "true");
          }}
        >
          同意する
        </SimpleButton>
      </Dialog>
      <Dialog valid={!!errorMessage}>
        <h2 className="font-bold">エラー</h2>
        <MultiLineBody body={errorMessage} />
        <SimpleButton
          onClick={() => {
            setErrorMessage("");
          }}
        >
          わかった
        </SimpleButton>
      </Dialog>
      <div className="fixed top-4 right-4 z-20 space-x-4 flex">
        {saved ? (
          <p>保存しました</p>
        ) : (
          <p className="w-[6rem] text-center rounded-xl bg-neutral-200">
            未保存…
          </p>
        )}
        <p>{textContent?.length}/1200 文字</p>
        <HeaderButton onClick={toConfirm}>
          <MdCheck className="w-6 h-6 p-0.5" />
          確認
        </HeaderButton>
      </div>
      <div className="space-y-8">
        <h2 className="text-xl font-bold">下書きを書く</h2>
        <Link
          href={"./address"}
          className="block w-full p-4 rounded-2xl border-2 border-neutral-200 hover:bg-neutral-200"
        >
          {addressProfile ? (
            <>
              <p>お届け先</p>
              <div className="flex space-x-2">
                <p className="font-bold">{addressProfile.display_name}</p>
                {addresProfileEvent && (
                  <p className="text-neutral-500 break-all">
                    @
                    {addressProfile.name ||
                      nip19.npubEncode(addresProfileEvent.pubkey)}
                  </p>
                )}
              </div>
            </>
          ) : (
            <p>お届け先を選ぶ…</p>
          )}
        </Link>
        {textContent === undefined ? (
          <p className="text-center">がんばってます…</p>
        ) : (
          <textarea
            value={textContent}
            maxLength={1200}
            placeholder="あのイーハトーヴォのすきとおった風、夏でも底に冷たさをもつ青いそら、うつくしい森で飾られたモリーオ市、郊外のぎらぎらひかる草の波…"
            className="w-full resize-none outline-none leading-9"
            onChange={handleChange}
            ref={textarea}
          />
        )}
      </div>
    </>
  );
}
