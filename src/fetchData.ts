"use client";

import {
  NDKEvent,
  NDKFilter,
  NDKNip07Signer,
  NDKUser,
} from "@nostr-dev-kit/ndk";
import { Region, getRegions } from "./getRegions";
import { create } from "zustand";
import { NDKSingleton } from "./NDKSingleton";

interface State {
  regions: Region[];
  profiles: NDKEvent[];
  follows: string[];
  user: NDKUser | undefined;
  ndk: NDKSingleton;
  notes: NDKEvent[];
}

interface Action {
  regionsPush: (newRegions: Region[]) => void;
  profilesPush: (newProfilesSet: Set<NDKEvent>) => void;
  notesPush: (newNotesSet: Set<NDKEvent>) => void;
  followsPush: (newFollows: string[]) => void;
}

const useStore = create<State & Action>((set) => ({
  regions: [],
  profiles: [],
  follows: [],
  user: undefined,
  ndk: new NDKSingleton(),
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
  followsPush: (newFollows) => {
    set((state) => ({
      follows: (() => {
        let res: string[] = [...state.follows];
        for (const value of newFollows) {
          if (!state.follows.find((element) => element == value)) {
            res = [...res, value];
          }
        }
        return res;
      })(),
    }));
  },
}));

export class FetchData {
  private _regions = useStore((state) => state.regions);
  private _profiles = useStore((state) => state.profiles);
  private _follows = useStore((state) => state.follows);
  private _user = useStore((state) => state.user);
  private _ndk = useStore((state) => state.ndk);
  private _notes = useStore((state) => state.notes);
  private followsPush = useStore((state) => state.followsPush);
  private profilesPush = useStore((state) => state.profilesPush);
  private regionsPush = useStore((store) => store.regionsPush);
  private notesPush = useStore((store) => store.notesPush);

  get user() {
    return this._user;
  }

  get follows() {
    return this._follows;
  }

  get profiles() {
    return this._profiles;
  }

  get regions() {
    return this._regions;
  }

  //NIP-07によるユーザ情報取得
  public async getUser() {
    const nip07signer = new NDKNip07Signer();
    const user = await nip07signer.user();
    useStore.setState({ user: user });
    return user;
  }

  //Kind-10002取得
  public async getExplicitRelayUrls(pubkey: string) {
    if (this._ndk.explicitRelayUrls?.length == 0) {
      this._ndk.explicitRelayUrls = [
        "wss://nos.lol",
        "wss://relay.damus.io",
        "wss://relay-jp.nostr.wirednet.jp",
        "wss://nostr-relay.nokotaro.com",
        "wss://nostr.holybea.com",
        "wss://nostr.fediverse.jp",
        "wss://yabu.me",
      ];

      const explicitRelayUrlsFilter: NDKFilter = {
        kinds: [10002],
        authors: [pubkey],
      };

      const explicitRelayUrlsEvent: NDKEvent | null =
        await this._ndk.fetchEvent(explicitRelayUrlsFilter);

      if (!explicitRelayUrlsEvent) {
        return;
      }

      let explicitRelayUrls: string[] = [];
      for (const value of explicitRelayUrlsEvent.tags) {
        if (value[0] == "r") {
          explicitRelayUrls = [...explicitRelayUrls, value[1]];
        }
      }
      this._ndk.explicitRelayUrls = explicitRelayUrls;
    }
  }

  //kind-3取得
  public async getFollows(pubkey: string) {
    let newFollows = this._follows;

    if (newFollows.length == 0) {
      const followsFilter: NDKFilter = {
        kinds: [3],
        authors: [pubkey],
      };

      const followsEvent: NDKEvent | null = await this._ndk.fetchEvent(
        followsFilter
      );

      if (!followsEvent) {
        return;
      }

      let follows: string[] = [];
      for (const value of followsEvent.tags) {
        if (value[0] == "p") {
          follows = [...follows, value[1]];
        }
      }

      this.followsPush(follows);
      return [...this._follows, ...follows];
    }
  }

  //kind-0取得
  public async getProfile(pubkeys: string[]) {
    let mustGetProfilePubkey: string[] = [];

    for (const pubkey of pubkeys) {
      if (!this._profiles.find((element) => element.pubkey == pubkey)) {
        mustGetProfilePubkey = [...mustGetProfilePubkey, pubkey];
      }
    }

    let newProfiles = new Set<NDKEvent>();

    if (mustGetProfilePubkey.length > 0) {
      const kind0Filter: NDKFilter = {
        kinds: [0],
        authors: mustGetProfilePubkey,
      };
      newProfiles = await this._ndk.fetchEvents(kind0Filter);
      this.profilesPush(newProfiles);
    }

    return [...this._profiles, ...Array.from(newProfiles)];
  }

  //Reagions取得
  public async getRegionsWrapper(pubkeys: string[]) {
    let mustGetRegionPubkey: string[] = [];

    for (const pubkey of pubkeys) {
      if (!this._regions.find((element) => element.pubkey == pubkey)) {
        mustGetRegionPubkey = [...mustGetRegionPubkey, pubkey];
      }
    }

    let newRegions: Region[] = [];

    if (mustGetRegionPubkey.length > 0) {
      newRegions = await getRegions(mustGetRegionPubkey);
      this.regionsPush(newRegions);
    }

    return [...this._regions, ...newRegions];
  }

  //kind-1取得 複数
  public async getNotes(filter: NDKFilter) {
    const newEvents = await this._ndk.fetchEvents(filter);
    this.notesPush(newEvents);
    return newEvents;
  }

  //kind-1取得 単独
  public async getAloneNote(id: string) {
    const note = this._notes.find((element) => element.id == id);

    const kind1Filter: NDKFilter = {
      kinds: [1],
      ids: [id],
      limit: 1,
    };

    const newKind1Event: NDKEvent | undefined =
      note || (await this._ndk.fetchEvent(kind1Filter)) || undefined;

    this.notesPush(newKind1Event ? new Set([newKind1Event]) : new Set());

    return newKind1Event;
  }

  //kind-0取得 単独
  public async getAloneProfile(pubkey: string) {
    const newProfile = this._profiles.find(
      (element) => element.pubkey == pubkey
    );

    const kind0Filter: NDKFilter = {
      kinds: [0],
      authors: [pubkey],
    };

    const profile =
      newProfile || (await this._ndk.fetchEvent(kind0Filter)) || undefined;

    this.profilesPush(
      profile ? new Set<NDKEvent>([profile]) : new Set<NDKEvent>([])
    );

    return profile;
  }

  //Region取得 単独
  public async getAloneRegion(pubkey: string) {
    const regions = await this.getRegionsWrapper([pubkey]);
    return regions.find((element) => element.pubkey == pubkey);
  }
}
