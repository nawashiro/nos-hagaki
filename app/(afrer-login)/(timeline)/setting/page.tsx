"use client";
import SimpleButton from "@/components/simpleButton";
import { useRouter } from "next/navigation";

export default function Setting() {
  const router = useRouter();
  const logout = () => {
    localStorage.clear();
    router.push("/");
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="font-bold">ログアウト</h2>
        <p>
          ローカルに保存されたデータを削除してログアウトします。
          <br />
          下書きは削除されます。
        </p>
        <SimpleButton onClick={logout}>ログアウトする</SimpleButton>
      </div>
    </div>
  );
}
