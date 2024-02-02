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
      className="flex space-x-4 px-2 rounded-xl hover:bg-neutral-200"
      {...props}
    >
      {children}
    </button>
  );
}
