import Link from "next/link";

export default function NavigationButton({
  href,
  title,
  children,
}: {
  href: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="w-12 lg:w-56 h-12 flex rounded-lg hover:bg-neutral-200"
    >
      {children}
      <p className="text-2xl my-auto ml-2 hidden lg:block">{title}</p>
    </Link>
  );
}
