import Link from "next/link";

export function H1({ children }: { children: React.ReactNode }) {
  return <h1 className="text-xl font-bold mb-8">{children}</h1>;
}

export function H2({
  children,
  ...params
}: React.HTMLAttributes<HTMLHeadingElement> & { children: React.ReactNode }) {
  return (
    <h2 {...params} className="font-bold my-8">
      {children}
    </h2>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="my-4">{children}</p>;
}

export function Ol({ children }: { children: React.ReactNode }) {
  return <ol className="ml-4 list-decimal">{children}</ol>;
}

export function Ul({ children }: { children: React.ReactNode }) {
  return <ul className="ml-4 list-disc">{children}</ul>;
}

export function LinkWrapper({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) {
  return (
    <Link href={href} className="text-neutral-400 hover:text-neutral-300">
      {children}
    </Link>
  );
}
