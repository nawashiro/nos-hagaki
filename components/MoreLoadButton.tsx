import { ButtonHTMLAttributes } from "react";
import SimpleButton from "./simpleButton";

export default function MoreLoadButton({
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <SimpleButton
      className="block mx-auto px-4 py-2 text-neutral-500 border-2 border-neutral-200 rounded-[2rem] hover:bg-neutral-200"
      {...props}
    >
      さらに読み込む
    </SimpleButton>
  );
}
