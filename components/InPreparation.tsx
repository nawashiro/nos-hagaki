"use client";
import { useRouter } from "next/navigation";
import { MdArrowBack } from "react-icons/md";

export default function InPreparation() {
  const router = useRouter();
  return (
    <div className="space-y-8">
      <h2 className="font-bold text-2xl">準備中</h2>
      <p>
        悪いけど、このページはまだ手を付けてる最中なのよ。
        <br />
        かっ、完成するまで、ちゃんと待っててよね！
      </p>
    </div>
  );
}
