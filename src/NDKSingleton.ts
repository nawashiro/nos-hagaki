"use client";
import NDK from "@nostr-dev-kit/ndk";
import NDKCacheAdapterDexie from "@nostr-dev-kit/ndk-cache-dexie";

export class NDKSingleton extends NDK {
  private static _instance: NDKSingleton;

  public static get instance(): NDKSingleton {
    if (!this._instance) {
      const dexieAdapter = new NDKCacheAdapterDexie({
        dbName: "ndk-cache",
      });
      this._instance = new NDKSingleton({ cacheAdapter: dexieAdapter });
    }

    return this._instance;
  }
}
