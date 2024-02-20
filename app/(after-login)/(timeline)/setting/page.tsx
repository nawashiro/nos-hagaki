"use client";
import SimpleButton from "@/components/simpleButton";
import { FetchData } from "@/src/fetchData";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Setting() {
  const fetchdata = new FetchData();
  const router = useRouter();

  const logout = () => {
    localStorage.clear();

    const request = indexedDB.deleteDatabase("ndk-cache"); // データベース名(testDB)に接続

    request.onsuccess = () => {
      console.log("DB successfully deleted");
    };

    request.onerror = () => {
      throw new Error("DBの削除に失敗しました");
    };

    window.location.reload();
  };

  useEffect(() => {
    const firstFetchData = async () => {
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
    firstFetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="font-bold">ログアウト</h2>
        <p>
          ローカルに保存された下書きは削除されるから気をつけなさい！
          <br />
          まっ、また来なさいよね！…待ってるから。
        </p>
        <SimpleButton onClick={logout}>ログアウトする</SimpleButton>
      </div>
    </div>
  );
}
