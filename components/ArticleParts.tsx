export function H1({ children }: { children: React.ReactNode }) {
  return <h1 className="text-xl font-bold my-8">{children}</h1>;
}

export function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="font-bold my-8">{children}</h2>;
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
