import NDK from "@nostr-dev-kit/ndk";

export class ServerNDKSingleton extends NDK {
  private static _instance: ServerNDKSingleton;

  public static get instance(): ServerNDKSingleton {
    if (!this._instance) {
      this._instance = new ServerNDKSingleton();
    }

    return this._instance;
  }
}
