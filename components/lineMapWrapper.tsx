"use client";
import dynamic from "next/dynamic";
import React from "react";

function LineMapWrapper() {
  const Map = React.useMemo(
    () =>
      dynamic(() => import("../components/lineMap"), {
        loading: () => <p>世界を見渡しています…</p>,
        ssr: false,
      }),
    []
  );
  return <Map />;
}

export default LineMapWrapper;
