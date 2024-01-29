"use client";
import dynamic from "next/dynamic";
import React from "react";

function MapWrapper() {
  const Map = React.useMemo(
    () =>
      dynamic(() => import("../components/map"), {
        loading: () => <p>A map is loading</p>,
        ssr: false,
      }),
    []
  );
  return <Map />;
}

export default MapWrapper;
