"use client";
import { createContext } from "react";
import { NDKSingleton } from "@/src/NDKSingleton";
import { Region } from "./getRegions";

export const NDKContext = createContext<NDKSingleton>(NDKSingleton.instance);
export const RegionContext = createContext<Region | null>(null);

interface DoubleReagion {
  address: Region;
  my: Region;
}

export const DoubleReagionContext = createContext<DoubleReagion | null>(null);
