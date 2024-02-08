"use client";
import axios from "axios";
import { CountryName, getCountryName } from "./getCountryName";

export interface Region {
  pubkey: string;
  longitude: number;
  latitude: number;
  countryName: CountryName;
}

export async function getRegions(pubkeys: string[]) {
  const res = await axios.get("/geojson/mundo.geojson");
  const geojsonData = res.data;

  const seedrandom = require("seedrandom");
  let regions: Region[] = [];

  for (const pubkey of pubkeys) {
    const rng = seedrandom(pubkey);
    const region: Region = await (async () => {
      while (true) {
        const longitude = rng() * 360 - 180; // 経度を-180から180の間でランダムに選ぶ
        const latitude = Math.acos(2 * rng() - 1) * (180 / Math.PI) - 90; // 緯度を-90から90の間でランダムに選ぶ

        const countryName = await getCountryName(
          latitude,
          longitude,
          geojsonData
        );

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
