"use client";
import { ButtonHTMLAttributes } from "react";

export default function HeaderButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
}) {
  return (
    <button
      className="flex outline-2 outline outline-neutral-200 border-neutral-200 space-x-4 px-2 rounded-xl text-neutral-500 hover:bg-neutral-200"
      {...props}
    >
      {children}
    </button>
  );
}
