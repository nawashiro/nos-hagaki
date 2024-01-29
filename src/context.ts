"use client";
import { createContext } from "react";
import { NDKSingleton } from "@/src/NDKSingleton";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { Region } from "./getRegions";

export const NDKContext = createContext<NDKSingleton>(NDKSingleton.instance);
export const ProfileContext = createContext<NDKEvent[]>([]);
export const RegionContext = createContext<Region>({
  countryName: null,
  latitude: null,
  longitude: null,
  pubkey: null,
});
