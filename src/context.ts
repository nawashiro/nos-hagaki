import { createContext } from "react";
import { NDKSingleton } from "@/src/NDKSingleton";
import { NDKEvent } from "@nostr-dev-kit/ndk";

export const NDKContext = createContext<NDKSingleton>(NDKSingleton.instance);
export const ProfileContext = createContext<Set<NDKEvent>>(new Set<NDKEvent>());
