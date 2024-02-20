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

//コンテナ船の速度1056Km/dayを基準とする
const kmPerDay = 1056;

interface State {
  regions: Region[];
  profiles: NDKEvent[];
  follows: string[];
  user: NDKUser | undefined;
  ndk: NDKSingleton;
  notes: NDKEvent[];
  daysRequireds: { daysRequired: number; pubkey: string }[];
  outboxRelays: string[];
}

interface Action {
  regionsPush: (newRegions: Region[]) => void;
  profilesPush: (newProfilesSet: Set<NDKEvent>) => void;
  notesPush: (newNotesSet: Set<NDKEvent>) => void;
  followsPush: (newFollows: string[]) => void;
  daysRequiredsPush: (newDaysRequired: number, newPubkey: string) => void;
}

const useStore = create<State & Action>((set) => ({
  regions: [],
  profiles: [],
  follows: [],
  user: undefined,
  ndk: NDKSingleton.instance,
  notes: [],
  daysRequireds: [],
  outboxRelays: [],
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
  followsPush: (newFollows) =>
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
    })),
  daysRequiredsPush: (newDaysRequired, newPubkey) =>
    set((state) => ({
      daysRequireds: (() => {
        let res = [...state.daysRequireds];
        if (
          !state.daysRequireds.find((element) => element.pubkey == newPubkey)
        ) {
          res = [...res, { daysRequired: newDaysRequired, pubkey: newPubkey }];
        }
        return res;
      })(),
    })),
}));

export class FetchData {
  private _regions = useStore((state) => state.regions);
  private _profiles = useStore((state) => state.profiles);
  private _follows = useStore((state) => state.follows);
  private _user = useStore((state) => state.user);
  private _ndk = useStore((state) => state.ndk);
  private _notes = useStore((state) => state.notes);
  private _daysRequireds = useStore((state) => state.daysRequireds);
  private _outboxRelays = useStore((state) => state.outboxRelays);
  private followsPush = useStore((state) => state.followsPush);
  private profilesPush = useStore((state) => state.profilesPush);
  private regionsPush = useStore((store) => store.regionsPush);
  private notesPush = useStore((store) => store.notesPush);
  private daysRequiredsPush = useStore((store) => store.daysRequiredsPush);

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

  get outboxRelays() {
    return this._outboxRelays;
  }

  public publish = async (event: NDKEvent) => {
    event.ndk = this._ndk;
    return await event.publish();
  };

  //NIP-07によるユーザ情報取得
  public async getUser() {
    let user = this._user;

    if (!user) {
      const nip07signer = new NDKNip07Signer();
      this._ndk.signer = nip07signer;
      user = await nip07signer.user();
      useStore.setState({ user: user });
    }

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

      //ndk.explicitRelayUrlsを設定
      let explicitRelayUrls: string[] = [];
      for (const value of explicitRelayUrlsEvent.tags) {
        if (value[0] == "r") {
          explicitRelayUrls = [...explicitRelayUrls, value[1]];
        }
      }
      this._ndk.explicitRelayUrls = explicitRelayUrls;

      //outboxを設定
      let outboxRelayUrls: string[] = [];
      for (const value of explicitRelayUrlsEvent.tags) {
        if (value[0] == "r" && (2 in value ? value[2] == "write" : true)) {
          outboxRelayUrls = [...outboxRelayUrls, value[1]];
        }
      }
      useStore.setState({ outboxRelays: outboxRelayUrls });
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

      newFollows = [];
      for (const value of followsEvent.tags) {
        if (value[0] == "p") {
          newFollows = [...newFollows, value[1]];
        }
      }

      this.followsPush(newFollows);
    }

    return newFollows;
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

  //kind-1からpubkeysを取得
  public async getPubkeysOfNotes(notes: Set<NDKEvent>) {
    let pubkeys = new Set<string>([]);
    for (const value of Array.from(notes)) {
      pubkeys = new Set([...pubkeys, value.pubkey]);
    }
    return Array.from(pubkeys);
  }

  //kind-1取得 単独
  public async getAloneNote(id: string) {
    const note = this._notes.find((element) => element.id == id);

    const kind1Filter: NDKFilter = {
      kinds: [1],
      ids: [id],
      limit: 1,
    };

    const newKind1Event = note || (await this._ndk.fetchEvent(kind1Filter));

    if (newKind1Event) this.notesPush(new Set([newKind1Event]));

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
      limit: 1,
    };

    const profile = newProfile || (await this._ndk.fetchEvent(kind0Filter));

    if (profile) this.profilesPush(new Set<NDKEvent>([profile]));

    return profile;
  }

  //Region取得 単独
  public async getAloneRegion(pubkey: string) {
    const regions = await this.getRegionsWrapper([pubkey]);
    return regions.find((element) => element.pubkey == pubkey);
  }

  //掛かる日数計算
  public async getEstimatedDeliveryTime(
    myPubkey: string,
    addressPubkey: string
  ) {
    const GeodesicLine = (await import("leaflet.geodesic")).GeodesicLine;

    const cash = this._daysRequireds.find(
      (element) => element.pubkey == addressPubkey
    );
    if (cash) {
      return cash.daysRequired;
    }

    const myRegion = await this.getAloneRegion(myPubkey);
    const addressRegion = await this.getAloneRegion(addressPubkey);

    if (!myRegion || !addressRegion) {
      throw new Error("どなたかが地球外にいらっしゃいます");
    }

    const line = new GeodesicLine();

    const cruisingDistance =
      line.distance(
        [myRegion.latitude, myRegion.longitude],
        [addressRegion.latitude, addressRegion.longitude]
      ) / 1000; //二点間の距離Km

    const daysRequired = Math.ceil(cruisingDistance / kmPerDay); //かかる時間
    this.daysRequiredsPush(daysRequired, addressPubkey);

    return daysRequired;
  }
}
