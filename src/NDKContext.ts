import { createContext } from "react";
import { NDKSingleton } from "@/src/NDKSingleton";

export const NDKContext = createContext(NDKSingleton.instance);
