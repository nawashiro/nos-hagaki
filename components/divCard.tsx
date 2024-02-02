"use client";
export default function DivCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full p-4 rounded-2xl outline-2 outline outline-neutral-200 space-y-4">
      {children}
    </div>
  );
}
