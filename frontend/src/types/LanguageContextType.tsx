import {SUPPORTED_LANGUAGES} from "../configs/AppConfig";

export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export interface LanguageContextType {
	language: Language;
	setLanguage: (lang: Language) => void;
	t: (key: string) => string;
	getNested?: (key: string) => unknown;
}
