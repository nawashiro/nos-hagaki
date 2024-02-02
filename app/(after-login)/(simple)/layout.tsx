"use client";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="px-4 py-24 min-h-screen">
      <div className="max-w-xl mx-auto">{children}</div>
    </main>
  );
}
