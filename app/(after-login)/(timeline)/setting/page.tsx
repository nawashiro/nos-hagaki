"use client";
import LoginWall from "@/components/loginWall";
import SimpleButton from "@/components/simpleButton";

export default function Setting() {
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

  return (
    <>
      <LoginWall />
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
    </>
  );
}
