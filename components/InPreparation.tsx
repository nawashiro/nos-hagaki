"use client";
import { useRouter } from "next/navigation";

export default function InPreparation() {
  const router = useRouter();
  return (
    <div className="space-y-8">
      <h2 className="font-bold text-xl">準備中</h2>
      <p>
        悪いけど、このページはまだ手を付けてる最中なのよ。
        <br />
        完成するまで待ってなさいよね！
      </p>
    </div>
  );
}
