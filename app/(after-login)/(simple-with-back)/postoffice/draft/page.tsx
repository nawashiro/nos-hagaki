"use client";

import HeaderButton from "@/components/headerButton";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MdCheck } from "react-icons/md";

export default function Draft() {
  const [textContent, setTextContent] = useState<string>();
  const textarea = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
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
      <div className="fixed top-4 right-4 z-20 space-x-2 flex text-neutral-500">
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
            maxLength={1200}
            placeholder="あのイーハトーヴォのすきとおった風、夏でも底に冷たさをもつ青いそら、うつくしい森で飾られたモリーオ市、郊外のぎらぎらひかる草の波…"
            className="w-full resize-none outline-none leading-9"
            onChange={(e) => {
              setTextContent(e.target.value);
            }}
            ref={textarea}
          >
            {textContent}
          </textarea>
        )}
      </div>
    </>
  );
}
