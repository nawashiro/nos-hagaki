import Link from "next/link";
import { MdOutlineHome, MdOutlineMarkunreadMailbox } from "react-icons/md";
import HeaderLink from "@/components/headerLink";
import NavigationButton from "@/components/navigationButton";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="px-4 py-4 flex fixed z-10 top-0 left-0 w-full backdrop-blur">
        <h1 className="font-bold">NosHagaki</h1>
        <HeaderLink href="#">ヘルプ</HeaderLink>
      </header>
      <main className="px-4 py-24 min-h-screen">
        <div className="fixed z-10 inset-0 top-24 left-4 w-12 lg:w-64 space-y-4">
          <NavigationButton href="/home" title="ホーム">
            <MdOutlineHome className="h-10 w-10 ml-1 my-auto" />
          </NavigationButton>
          <NavigationButton href="/mailbox" title="郵便受け">
            <MdOutlineMarkunreadMailbox className="h-10 w-10 ml-1 my-auto" />
          </NavigationButton>
          <Link
            href={"/draft"}
            className="w-12 lg:w-64 h-12 flex rounded-3xl border-2 border-neutral-200 hover:bg-neutral-200"
          >
            <p className="text-2xl m-auto text-neutral-500 hidden lg:block">
              はがきを書く
            </p>
          </Link>
        </div>
        <div className="max-w-xl space-y-4 ml-16 md:mx-auto">{children}</div>
      </main>
    </>
  );
}
