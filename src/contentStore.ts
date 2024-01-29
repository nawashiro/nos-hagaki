"use client";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { Region } from "./getRegions";
import { create } from "zustand";

interface State {
  regions: Region[];
  profiles: NDKEvent[];
  notes: NDKEvent[];
}

interface Action {
  regionsPush: (newRegions: Region[]) => void;
  profilesPush: (newProfilesSet: Set<NDKEvent>) => void;
  notesPush: (newNotesSet: Set<NDKEvent>) => void;
}

export const contentStore = create<State & Action>((set) => ({
  regions: [],
  profiles: [],
  notes: [],
  regionsPush: (newRegions) =>
    set((state) => ({
      regions: (() => {
        let res: Region[] = [...state.regions];
        for (const value of newRegions) {
          if (
            !state.regions.find((element) => element.pubkey == value.pubkey)
          ) {
            res = [...res, value];
          }
        }
        return res;
      })(),
    })),
  profilesPush: (newProfilesSet) =>
    set((state) => ({
      profiles: (() => {
        const newProfiles = Array.from(newProfilesSet);
        let res: NDKEvent[] = [...state.profiles];
        for (const value of newProfiles) {
          if (!state.profiles.find((element) => element.id == value.id)) {
            res = [...res, value];
          }
        }
        return res;
      })(),
    })),
  notesPush: (newNotesSet) =>
    set((state) => ({
      notes: (() => {
        let newNotes = Array.from(newNotesSet);
        let res: NDKEvent[] = [...state.notes];
        for (const value of newNotes) {
          if (!state.notes.find((element) => element.id == value.id)) {
            res = [...res, value];
          }
        }
        return res;
      })(),
    })),
}));
