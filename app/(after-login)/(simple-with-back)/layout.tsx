"use client";
import { useRouter } from "next/navigation";
import { MdArrowBack } from "react-icons/md";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <>
      <header className="p-4 flex fixed z-10 top-0 left-0 w-full backdrop-blur">
        <button onClick={() => router.back()}>
          <MdArrowBack className="h-6 w-6 rounded-lg hover:bg-neutral-200" />
        </button>
      </header>
      <main className="px-4 py-24 min-h-screen">
        <div className="max-w-xl ml-16 md:mx-auto">{children}</div>
      </main>
    </>
  );
}
