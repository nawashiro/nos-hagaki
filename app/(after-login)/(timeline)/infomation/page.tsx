"use client";
import { FetchData } from "@/src/fetchData";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { MdOutlineOpenInNew } from "react-icons/md";

export default function Infomation() {
  const fetchdata = new FetchData();
  const router = useRouter();

  useEffect(() => {
    const firstFetch = async () => {
      //NIP-07によるユーザ情報取得
      let user;
      try {
        if (!localStorage.getItem("login")) {
          throw new Error("未ログイン");
        }
        user = await fetchdata.getUser();
      } catch {
        router.push("/");
        return;
      }
    };

    firstFetch();
  }, []);
  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold">NosHagakiについて</h1>
      <div>
        <p>
          Github:<> </>
          <a
            className="break-words text-neutral-400 underline hover:text-neutral-300"
            href={"https://github.com/nawashiro/nos-hagaki"}
            target="_blank"
          >
            nawashiro/nos-hagaki
            <MdOutlineOpenInNew className="inline-block h-4 w-4 mb-[7.2px]" />
          </a>
        </p>
        <p>
          Author:<> </>
          <Link
            href={
              "/author/04c4089f9e54c3883355a6739141e54376f7aabd7a8565e7483e8173dfd1a512"
            }
            className="text-neutral-400 hover:text-neutral-300"
          >
            @Nawashiro
          </Link>
        </p>
      </div>
    </div>
  );
}
