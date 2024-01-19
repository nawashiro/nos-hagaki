import DivCard from "@/components/divCard";
import SimpleButton from "@/components/simpleButton";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <DivCard>
        <p>
          あんたがユーザー？初めましてかもしれないわね。このアプリはWeb用のNostrクライアントよ！はがきを送りあうような操作感を目指しているの。
          <br />
          使い方はヘルプにまとめてあるし、右上からいつでも呼び出せるわ。
          <br />
          べっ、別にあんたのためじゃないんだからねっ！
        </p>
        <div className="flex space-x-4">
          <SimpleButton>わかった</SimpleButton>
          <Link
            href={"#"}
            className="px-4 py-2 text-neutral-500 border-2 border-neutral-200 rounded-[2rem] hover:bg-neutral-200"
          >
            ヘルプを見る
          </Link>
        </div>
      </DivCard>
    </>
  );
}
