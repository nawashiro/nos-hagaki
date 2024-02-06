"use client";
import { ButtonHTMLAttributes } from "react";
import SimpleButton from "./simpleButton";

export default function MoreLoadButton({
  valid,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  valid: boolean;
}) {
  return (
    valid && (
      <SimpleButton
        className="block mx-auto px-4 py-2 outline-2 outline outline-neutral-200 rounded-[2rem] hover:bg-neutral-200"
        {...props}
      >
        さらに読み込む
      </SimpleButton>
    )
  );
}
