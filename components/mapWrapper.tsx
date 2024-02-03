"use client";
import dynamic from "next/dynamic";
import React from "react";

function MapWrapper() {
  const Map = React.useMemo(
    () =>
      dynamic(() => import("../components/map"), {
        loading: () => <p>世界を見渡しています…</p>,
        ssr: false,
      }),
    []
  );
  return <Map />;
}

export default MapWrapper;
