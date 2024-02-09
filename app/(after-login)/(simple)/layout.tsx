"use client";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="h-14 flex fixed z-10 top-0 left-0 w-full backdrop-blur"></header>
      <main className="px-4 py-24 min-h-screen">
        <div className="max-w-xl mx-auto">{children}</div>
      </main>
    </>
  );
}
