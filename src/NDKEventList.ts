import { NDKEvent } from "@nostr-dev-kit/ndk";

export class NDKEventList {
  private _until: number;
  private _eventList: Set<NDKEvent>;

  public constructor() {
    this._eventList = new Set<NDKEvent>();
    this._until = Math.trunc(new Date().getTime() / 1000);
  }

  public concat(eventSet: Set<NDKEvent>) {
    for (const event of eventSet) {
      if (
        !Array.from(this._eventList).find((element) => element.id == event.id)
      ) {
        this._eventList.add(event);
        const created_at = event.created_at || 0;
        if (this._until > created_at) {
          this._until = created_at;
        }
      }
    }

    return this;
  }

  get eventList(): Set<NDKEvent> {
    return this._eventList;
  }

  get until(): number {
    return this._until;
  }

  set until(until: number) {
    this._until = until;
  }
}
