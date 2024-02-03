"use client";

import Dialog from "@/components/dialog";
import HeaderButton from "@/components/headerButton";
import SimpleButton from "@/components/simpleButton";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MdCheck } from "react-icons/md";

export default function Draft() {
  const [textContent, setTextContent] = useState<string>();
  const textarea = useRef<HTMLTextAreaElement>(null);
  const [timestamp, setTimestamp] = useState(Date.now());
  const timer = useRef<NodeJS.Timeout | null>(null);
  const [saved, setSaved] = useState<boolean>(true);
  const [dialogViewFlag, setDialogViewFlag] = useState<boolean>(false);

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
    setDialogViewFlag(localStorage.getItem("notice-dialog-accepted") != "true");
    const savedText = localStorage.getItem("draft-text");
    setTextContent(savedText || "");
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

  return (
    <>
      <Dialog valid={dialogViewFlag}>
        <div className="space-y-4">
          <h2 className="font-bold">ご注意</h2>
          <p>大事なことが3つあるわ。操作を始める前に読んでおいてよね！</p>
        </div>
        <ol className="font-bold list-decimal ml-[18.27px]">
          <li>
            秘密を書かないでください。内容はNostrのメンションとして全世界に公開されます。
          </li>
          <li>都合により、お届けできない場合があります。</li>
          <li>攻撃的なコンテンツや違法なコンテンツの投函はご遠慮ください。</li>
        </ol>
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
      <div className="fixed top-4 right-4 z-20 space-x-4 flex">
        {saved ? (
          <p>保存しました</p>
        ) : (
          <p className="w-[6rem] text-center rounded-xl bg-neutral-200">
            未保存…
          </p>
        )}
        <p>{textContent?.length}/1200 文字</p>
        <HeaderButton>
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
          <p>お届け先</p>
          <div className="flex space-x-2">
            <p className="font-bold">アイ・ボーンズ</p>
            <p className="text-neutral-500 break-all">@i_bones</p>
          </div>
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
