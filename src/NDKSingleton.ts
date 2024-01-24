"use client";
import NDK from "@nostr-dev-kit/ndk";
export class NDKSingleton extends NDK {
  private static _instance: NDKSingleton;

  public static get instance(): NDKSingleton {
    if (!this._instance) {
      this._instance = new NDKSingleton();
    }

    return this._instance;
  }
}
