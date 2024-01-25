import { NDKEvent } from "@nostr-dev-kit/ndk";

export class NDKEventList {
  private _until: number;
  private _eventList: NDKEvent[];

  public constructor(eventList: NDKEvent[]) {
    this._eventList = eventList;
    this._until = Math.trunc(new Date().getTime() / 1000);
  }

  public push(event: NDKEvent) {
    this._eventList = [...this._eventList, event];
  }

  get eventList(): NDKEvent[] {
    return this._eventList;
  }
}
