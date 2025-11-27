import {createContext} from "react";
import type {LanguageContextType} from "../types/LanguageContextType";

export const LanguageContext = createContext<LanguageContextType | undefined>(
	undefined
);
