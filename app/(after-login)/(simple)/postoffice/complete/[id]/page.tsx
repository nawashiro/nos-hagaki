"use client";

import { useEffect, useState } from "react";

export default function Complete({ params }: { params: { id: string } }) {
  const [createdAt, setCreatedAt] = useState<number>();
  const [dateString, setDateString] = useState<string>();
  const [messageTextContent, setMessageTextContent] = useState<string>();

  useEffect(() => {
    const firstFetch = async () => {
      const res = await fetch(`/api/complete-result?id=${params.id}`);
      if (res.status != 200) {
        throw new Error(`Error: ${res.status}`);
      }
      const data = await res.json();
      const sendAt: number = data.sendAt;
      console.log(sendAt);
      setCreatedAt(sendAt);

      var sendDay = new Date(sendAt * 1000);
      var year = sendDay.getFullYear();
      var month = sendDay.getMonth() + 1;
      var day = sendDay.getDate();
      const dateString = year + "年" + month + "月" + day + "日";
      setDateString(dateString);
    };
    firstFetch();
  }, []);

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold">投函しました</h2>
      <p>
        投函できたようね！
        <br />
        お届け予定日をお知らせするわ。
      </p>
      <p className="font-bold">お届け予定日 {dateString || "いつか…"}</p>
    </div>
  );
}
