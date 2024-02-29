"use client";
import { FetchData } from "@/src/fetchData";
import { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEventHandler, useEffect, useState } from "react";

export default function Edit() {
  const fetchdata = new FetchData();
  const router = useRouter();
  const [myProfile, setMyProfile] = useState<any>();
  const [user, setUser] = useState<NDKUser>();

  useEffect(() => {
    (async () => {
      //NIP-07によるユーザ情報取得
      let user;
      try {
        if (!localStorage.getItem("login")) {
          throw new Error("未ログイン");
        }
        user = await fetchdata.getUser();
        setUser(user);
      } catch {
        router.push("/");
        return;
      }

      //kind-10002取得
      await fetchdata.getExplicitRelayUrls(user.pubkey);

      //kind-0取得
      const newMyProfile = await fetchdata.getAloneProfile(user.pubkey);
      setMyProfile(newMyProfile ? JSON.parse(newMyProfile.content) : {});
    })();
  }, []);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const newProfile = {
      ...myProfile,
      picture: form.get("picture"),
      display_name: form.get("display_name"),
      name: form.get("name"),
      website: form.get("website"),
      about: form.get("about"),
    };
    const newKind0 = new NDKEvent(fetchdata.ndk);
    newKind0.content = JSON.stringify(newProfile);
    newKind0.kind = 0;
    await newKind0.publish();

    const request: IDBOpenDBRequest = indexedDB.open("ndk-cache");

    request.onerror = () => {
      console.error(`Database error`);
    };

    fetchdata.profiles = fetchdata.profiles.filter(
      (e) => e.pubkey != user?.pubkey
    );

    router.push("/home");
  };
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold">プロフィールを編集</h2>
      <form onSubmit={handleSubmit} className="space-y-4 w-full">
        <div>
          <label>アイコン画像のurl</label>
          <br />
          <input
            type="text"
            name="picture"
            defaultValue={myProfile?.picture || ""}
            placeholder="https://example.com/bulldozer_with_computer.png"
            className="rounded-lg outline-2 outline outline-neutral-200 px-2 py-1 w-full"
          />
        </div>
        <div>
          <label>表示名</label>
          <br />
          <input
            type="text"
            name="display_name"
            placeholder="田中角栄"
            defaultValue={myProfile?.display_name || ""}
            className="rounded-lg outline-2 outline outline-neutral-200 px-2 py-1 w-full"
          />
        </div>
        <div>
          <label>@名前</label>
          <br />
          <input
            type="text"
            name="name"
            placeholder="Kakuei_Tanaka"
            defaultValue={myProfile?.name || ""}
            className="rounded-lg outline-2 outline outline-neutral-200 px-2 py-1 w-full"
          />
        </div>
        <div>
          <label>ウェブサイト</label>
          <br />
          <input
            type="text"
            name="website"
            placeholder="https://www.kantei.go.jp/jp/rekidainaikaku/065.html"
            defaultValue={myProfile?.website || ""}
            className="rounded-lg outline-2 outline outline-neutral-200 px-2 py-1 w-full"
          />
        </div>
        <div>
          <label>説明</label>
          <br />
          <textarea
            name="about"
            defaultValue={myProfile?.about || ""}
            placeholder="私が田中角栄であります。皆さんもご存じの通り、高等小学校卒業であります。"
            className="rounded-lg outline-2 outline outline-neutral-200 px-2 py-1 w-full"
          />
        </div>
        <div className="flex space-x-4">
          <input
            type="submit"
            className="cursor-pointer px-4 py-2 text-neutral-500 outline-2 outline outline-neutral-200 rounded-[2rem] hover:bg-neutral-200"
          />
          <Link
            href={"/home"}
            className="px-4 py-2 text-neutral-500 outline-2 outline outline-neutral-200 rounded-[2rem] hover:bg-neutral-200"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  );
}
