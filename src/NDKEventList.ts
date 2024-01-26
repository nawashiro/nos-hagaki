import { NDKEvent } from "@nostr-dev-kit/ndk";

export class NDKEventList {
  private _until: number;
  private _eventList: NDKEvent[];

  public constructor(eventList: NDKEvent[]) {
    this._eventList = eventList;
    this._until = Math.trunc(new Date().getTime() / 1000);
  }

  public push(event: NDKEvent) {
    if (!this._eventList.find((element: NDKEvent) => element.id == event.id)) {
      const created_at = event.created_at || 0;
      if (this._until > created_at) {
        this._until = created_at;
      }

      this._eventList = [...this._eventList, event];
    }
  }

  get eventList(): NDKEvent[] {
    return this._eventList;
  }

  get until(): number {
    return this._until;
  }

  set until(until: number) {
    this._until = until;
  }
}
