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
      <button onClick={() => router.back()}>
        <MdArrowBack className="fixed top-4 left-4 z-20 h-6 w-6 rounded-lg hover:bg-neutral-200" />
      </button>
      {children}
    </>
  );
}
