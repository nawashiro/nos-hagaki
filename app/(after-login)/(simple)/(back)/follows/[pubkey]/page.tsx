"use client";

import ProfileButton from "@/components/profileButton";
import { FetchData } from "@/src/fetchData";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Author({ params }: { params: { pubkey: string } }) {
  const fetchdata = new FetchData();
  const router = useRouter();
  const [follows, setFollows] = useState<string[]>([]);

  useEffect(() => {
    const firstFetchdata = async () => {
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

      //kind-10002取得
      await fetchdata.getExplicitRelayUrls(user.pubkey);

      //kind-3取得
      const newFollows =
        (await fetchdata.getFollows(params.pubkey, false)) || [];

      if (newFollows.length == 0) {
        return;
      }

      setFollows(newFollows);

      //kind-0取得
      await fetchdata.getProfile(newFollows);

      //すみか情報を取得
      await fetchdata.getRegionsWrapper(newFollows);
    };
    firstFetchdata();
  }, []);

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold">フォロー一覧</h2>
      <div className="space-y-4">
        {follows.map((pubkey, index) => (
          <ProfileButton
            pubkey={pubkey}
            key={index}
            value={pubkey}
            onClick={() => router.push(`/author/${pubkey}`)}
          />
        ))}
      </div>
    </div>
  );
}
