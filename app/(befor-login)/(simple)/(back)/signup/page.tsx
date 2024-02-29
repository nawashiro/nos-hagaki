"use client";
import Dialog from "@/components/dialog";
import SimpleButton from "@/components/simpleButton";
import { agreeCheck } from "@/src/agreeCheck";
import { FetchData } from "@/src/fetchData";
import { NDKEvent, NDKFilter } from "@nostr-dev-kit/ndk";
import { useRouter } from "next/navigation";
import { nip19 } from "nostr-tools";
import { generateSecretKey, getPublicKey } from "nostr-tools/pure";
import { useEffect, useState } from "react";
import { MdOutlineContentCopy } from "react-icons/md";

export default function Signup() {
  const [nsec, setNsec] = useState<string>();
  const router = useRouter();
  const fetchdata = new FetchData();
  const [dialogViewFlag, setDialogViewFlag] = useState<boolean>(false);

  useEffect(() => {
    (() => {
      //同意チェック
      if (!agreeCheck()) {
        router.push("/");
      }

      let sk = generateSecretKey(); // `sk` is a Uint8Array
      let nsec = nip19.nsecEncode(sk);
      setNsec(nsec);
    })();
  }, []);

  const start = async () => {
    //NIP-07によるユーザ情報取得
    let user;
    try {
      user = await fetchdata.getUser();
    } catch {
      setDialogViewFlag(true);
      return;
    }

    //kind-10002取得
    await fetchdata.getExplicitRelayUrls(user.pubkey);

    const newKind10002 = new NDKEvent(fetchdata.ndk);
    newKind10002.kind = 10002;
    newKind10002.tags = [
      ["r", "wss://nos.lol"],
      ["r", "wss://relay.damus.io"],
      ["r", "wss://relay-jp.nostr.wirednet.jp"],
      ["r", "wss://nostr-relay.nokotaro.com"],
      ["r", "wss://nostr.holybea.com"],
      ["r", "wss://nostr.fediverse.jp"],
      ["r", "wss://yabu.me"],
    ];

    await newKind10002.publish();
    localStorage.setItem("login", user.npub);
    router.push("/home");
  };

  return (
    <>
      <Dialog valid={dialogViewFlag}>
        <h2 className="font-bold">エラー</h2>
        <p>拡張機能がインストールされていません。</p>
        <SimpleButton
          onClick={() => {
            setDialogViewFlag(false);
            localStorage.setItem("notice-dialog-accepted", "true");
          }}
        >
          わかった
        </SimpleButton>
      </Dialog>
      <div className="space-y-8">
        <h2 className="text-xl font-bold">アカウント作成</h2>
        <div className="space-y-4">
          <h2 className="font-bold">1. NIP-07ブラウザ拡張機能のインストール</h2>
          <p>
            まずはNIP-07ブラウザ拡張機能をインストールしましょう。
            <br />
            以下のようなページで探すことができます。
            <br />
            インストール後は、ページの再読み込みなどが必要になるかもしれません。
            <br />
            <a
              className="text-neutral-400 underline hover:text-neutral-300"
              target="_blank"
              href="https://scrapbox.io/nostr/NIP-07"
            >
              https://scrapbox.io/nostr/NIP-07
            </a>
            <br />
            <a
              className="text-neutral-400 underline hover:text-neutral-300"
              target="_blank"
              href="https://github.com/aljazceru/awesome-nostr#nip-07-browser-extensions"
            >
              https://github.com/aljazceru/awesome-nostr#nip-07-browser-extensions
            </a>
          </p>
        </div>
        <div className="space-y-4">
          <h2 className="font-bold">
            2. 拡張機能やパスワードマネージャに秘密鍵を登録する
          </h2>
          <p>
            拡張機能に秘密鍵を生成する機能があれば、この章は飛ばして構いません。そちらの機能を使用して秘密鍵を生成してください。パスワードマネージャなどへのバックアップも忘れずに。
          </p>
          <p>
            もし拡張機能に秘密鍵を生成する機能が無ければ、
            以下から秘密鍵をコピーして、拡張機能の private key あるいは secret
            key といった項目に登録してください。
            そして、パスワードマネージャなどに登録しておきましょう。
          </p>

          {nsec && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(nsec);
              }}
              className="w-48 flex text-neutral-500 px-2 rounded-xl outline-2 outline outline-neutral-200 hover:bg-neutral-200"
            >
              <p className="truncate">{nsec}</p>
              <div className="mt-auto mb-auto">
                <MdOutlineContentCopy className="h-4 w-4" />
              </div>
            </button>
          )}
          <p>
            秘密鍵は極めて重要なデータです。漏らしても、忘れてもいけません。
            <br />
            漏らしたり、忘れたりしてしまうと、あなたのアカウントはネットのフリー素材になってしまうか、永遠に失われてしまうでしょう。
          </p>
        </div>
        <div className="space-y-4">
          <h2 className="font-bold">3. はじめよう</h2>
          <p>
            「はじめる」ボタンを押すと、拡張機能から同意を求められます。
            これは「このアプリに対して、あなたの秘密鍵を使用した署名を提供してもよいか」という意思の確認です。
            <br />
            同意すれば、最初に必要な情報をネットワークに送信して、Nostrを開始することができます。
          </p>
          <SimpleButton onClick={start}>はじめる</SimpleButton>
        </div>
      </div>
    </>
  );
}
