import Link from "next/link";

export default function HeaderLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="ml-auto text-neutral-500 px-2 rounded-xl hover:bg-neutral-200"
    >
      {children}
    </Link>
  );
}
