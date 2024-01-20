"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  useEffect(() => {
    if (!localStorage.getItem("login")) {
      router.push("/");
    }
  });

  return <>{children}</>;
}
