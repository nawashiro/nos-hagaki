"use client";
import axios from "axios";
import { CountryName, GeoJSONFeature, getCountryName } from "./getCountryName";
import { createStore } from "zustand/vanilla";
import { del, get, set } from "idb-keyval";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";

export const IdbStorage: StateStorage = {
  getItem: async (name) => {
    // Exit early on server
    if (typeof indexedDB === "undefined") {
      return null;
    }
    const value = await get(name);
    console.log("load indexeddb called");
    return value || null;
  },
  setItem: async (name, value) => {
    // Exit early on server
    if (typeof indexedDB === "undefined") {
      return;
    }
    return set(name, value);
  },
  removeItem: async (name) => {
    // Exit early on server
    if (typeof indexedDB === "undefined") {
      return;
    }
    await del(name);
  },
};

export interface Region {
  pubkey: string;
  longitude: number;
  latitude: number;
  countryName: CountryName;
}

interface State {
  features: GeoJSONFeature[];
  get: boolean;
}

const store = createStore(
  persist<State>(
    () => ({
      features: [],
      get: true,
    }),
    { name: "features-storage", storage: createJSONStorage(() => IdbStorage) }
  )
);

const getFeature = async () => {
  const res = await axios.get("/geojson/mundo.geojson");
  const features: GeoJSONFeature[] = res.data.features;
  return features;
};

function sleep(milliSeconds: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), milliSeconds);
  });
}

export async function getRegions(pubkeys: string[]) {
  const { features, get } = store.getState();

  if (get) {
    store.setState({ get: false });
    store.setState({ features: await getFeature() });
  }

  if (features.length == 0) {
    await sleep(1000);
    return getRegions(pubkeys);
  }

  const seedrandom = require("seedrandom");
  let regions: Region[] = [];

  for (const pubkey of pubkeys) {
    const rng = seedrandom(pubkey);
    const region: Region = (() => {
      while (true) {
        const longitude = rng() * 360 - 180; // 経度を-180から180の間でランダムに選ぶ
        const latitude = -Math.asin(2 * rng() - 1) * (180 / Math.PI); // 緯度を-90から90の間でランダムに選ぶ

        const countryName = getCountryName(latitude, longitude, features);

        if (countryName) {
          return {
            pubkey: pubkey,
            longitude: longitude,
            latitude: latitude,
            countryName: countryName,
          };
        }
      }
    })();

    regions = [...regions, region];
  }

  return regions;
}
