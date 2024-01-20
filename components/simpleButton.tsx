import { ButtonHTMLAttributes } from "react";

export default function SimpleButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
}) {
  return (
    <button
      className="px-4 py-2 text-neutral-500 border-2 border-neutral-200 rounded-[2rem] hover:bg-neutral-200"
      {...props}
    >
      {children}
    </button>
  );
}
