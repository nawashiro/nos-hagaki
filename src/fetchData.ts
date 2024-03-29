"use client";

import {
  NDKEvent,
  NDKFilter,
  NDKNip07Signer,
  NDKRelay,
  NDKRelaySet,
  NDKUser,
} from "@nostr-dev-kit/ndk";
import { Region, getRegions } from "./getRegions";
import { create } from "zustand";
import { NDKSingleton } from "./NDKSingleton";

//地球を半周するのに一週間かかる速度
const kmPerDay = 2857;

interface State {
  regions: Set<Region>;
  profiles: NDKEvent[];
  follows: Set<string>;
  user: NDKUser | undefined;
  ndk: NDKSingleton;
  notes: NDKEvent[];
  daysRequireds: { daysRequired: number; pubkey: string }[];
  outboxRelays: string[];
  kind3: NDKEvent | null;
}

interface Action {
  regionsPush: (newRegions: Set<Region>) => void;
  profilesPush: (newProfilesSet: Set<NDKEvent>) => void;
  notesPush: (newNotesSet: Set<NDKEvent>) => void;
  followsPush: (newFollows: Set<string>) => void;
  daysRequiredsPush: (newDaysRequired: number, newPubkey: string) => void;
  kind3Push: (newKind3: NDKEvent | null) => void;
}

const useStore = create<State & Action>((set) => ({
  regions: new Set<Region>([]),
  profiles: [],
  follows: new Set<string>([]),
  user: undefined,
  ndk: NDKSingleton.instance,
  notes: [],
  daysRequireds: [],
  outboxRelays: [],
  kind3: new NDKEvent(),
  regionsPush: (newRegions) =>
    set((state) => ({
      regions: new Set<Region>([...state.regions, ...newRegions]),
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
      follows: new Set<string>([...state.follows, ...newFollows]),
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
  kind3Push: (newKind3) => set((state) => ({ kind3: newKind3 })),
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
  private _kind3 = useStore((state) => state.kind3);
  private followsPush = useStore((state) => state.followsPush);
  private profilesPush = useStore((state) => state.profilesPush);
  private regionsPush = useStore((store) => store.regionsPush);
  private notesPush = useStore((store) => store.notesPush);
  private daysRequiredsPush = useStore((store) => store.daysRequiredsPush);
  private kind3Push = useStore((state) => state.kind3Push);

  get user() {
    return this._user;
  }

  get follows() {
    return Array.from(this._follows);
  }

  set follows(follows: string[]) {
    useStore.setState({ follows: new Set<string>(follows) });
  }

  get profiles() {
    return this._profiles;
  }

  set profiles(events: NDKEvent[]) {
    useStore.setState({ profiles: events });
  }

  get regions() {
    return Array.from(this._regions);
  }

  get outboxRelays() {
    return this._outboxRelays;
  }

  get kind3() {
    return this._kind3;
  }

  set kind3(event: NDKEvent | null) {
    this.kind3Push(event);
  }

  get ndk() {
    return this._ndk;
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
  public async getFollows(pubkey: string, cache = true) {
    let newFollows = this._follows;

    if (!cache || (newFollows.size == 0 && this._kind3 != null)) {
      const followsFilter: NDKFilter = {
        kinds: [3],
        authors: [pubkey],
      };

      const followsEvent: NDKEvent | null = await this._ndk.fetchEvent(
        followsFilter
      );

      if (cache) {
        this.kind3Push(followsEvent);
      }

      if (!followsEvent) {
        return;
      }

      newFollows = new Set<string>([]);
      for (const value of followsEvent.tags) {
        if (value[0] == "p") {
          newFollows = new Set<string>([...newFollows, value[1]]);
        }
      }

      if (cache) {
        this.followsPush(newFollows);
      }
    }

    return Array.from(newFollows);
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
      if (
        !Array.from(this._regions).find((element) => element.pubkey == pubkey)
      ) {
        mustGetRegionPubkey = [...mustGetRegionPubkey, pubkey];
      }
    }

    let newRegions: Region[] = [];

    if (mustGetRegionPubkey.length > 0) {
      newRegions = await getRegions(mustGetRegionPubkey);
      this.regionsPush(new Set<Region>(newRegions));
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
  public async getAloneProfile(pubkey: string, relays: string[] = []) {
    const newProfile = this._profiles.find(
      (element) => element.pubkey == pubkey
    );

    const kind0Filter: NDKFilter = {
      kinds: [0],
      authors: [pubkey],
      limit: 1,
    };

    let profile: NDKEvent | null;
    if (newProfile) {
      profile = newProfile;
    } else if (relays.length > 0) {
      let relaySet = new Set<NDKRelay>();

      for (const relayString of relays) {
        relaySet = new Set([new NDKRelay(relayString), ...relaySet]);
      }

      profile = await this._ndk.fetchEvent(
        kind0Filter,
        undefined,
        new NDKRelaySet(relaySet, this._ndk)
      );
    } else {
      profile = await this._ndk.fetchEvent(kind0Filter);
    }

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
