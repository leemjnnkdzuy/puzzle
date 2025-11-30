import React, {useState, useEffect, useCallback, useRef} from "react";
import type {ReactNode} from "react";
import {createContext} from "react";
import {DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES} from "@/configs/AppConfig";

export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export interface LanguageContextType {
	language: Language;
	setLanguage: (lang: Language) => void;
	t: (key: string) => string;
	getNested?: (key: string) => unknown;
}
import enTranslations from "@/lang/Global/en.json";
import viTranslations from "@/lang/Global/vi.json";
import userService from "@/services/UserService";

export const LanguageContext = createContext<LanguageContextType | undefined>(
	undefined
);

const flattenTranslations = (
	obj: Record<string, unknown>,
	prefix = ""
): Record<string, unknown> => {
	const flattened: Record<string, unknown> = {};
	for (const key in obj) {
		const value = obj[key];
		const newKey = prefix ? `${prefix}.${key}` : key;
		if (Array.isArray(value)) {
			flattened[newKey] = value;
			value.forEach((item, index) => {
				if (typeof item === "object" && item !== null) {
					Object.assign(
						flattened,
						flattenTranslations(
							item as Record<string, unknown>,
							`${newKey}.${index}`
						)
					);
				} else {
					flattened[`${newKey}.${index}`] = item;
				}
			});
		} else if (typeof value === "object" && value !== null) {
			Object.assign(
				flattened,
				flattenTranslations(value as Record<string, unknown>, newKey)
			);
		} else {
			flattened[newKey] = value;
		}
	}
	return flattened;
};

const flattenedTranslations = {
	en: flattenTranslations(enTranslations),
	vi: flattenTranslations(viTranslations),
};

const nestedTranslations = {
	en: enTranslations,
	vi: viTranslations,
};

interface LanguageProviderProps {
	children: ReactNode;
	isAuthenticated?: boolean;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
	children,
	isAuthenticated = false,
}) => {
	const [language, setLanguageState] = useState<Language>(() => {
		try {
			const saved = localStorage.getItem("language");
			if (saved && SUPPORTED_LANGUAGES.includes(saved)) {
				return saved as Language;
			}
			const defaultLang: Language = DEFAULT_LANGUAGE as Language;
			try {
				localStorage.setItem("language", defaultLang);
			} catch (e) {
				console.warn("Could not save language to localStorage:", e);
			}
			return defaultLang;
		} catch (e) {
			console.warn("Could not access localStorage:", e);
			return DEFAULT_LANGUAGE as Language;
		}
	});
	const isSyncingRef = useRef(false);

	useEffect(() => {
		if (isAuthenticated) {
			const loadLanguageFromServer = async () => {
				if (isSyncingRef.current) return;
				try {
					isSyncingRef.current = true;
					const result = await userService.getPreferences();
					if (result.success && result.data?.language) {
						const serverLanguage = result.data.language;
						if (SUPPORTED_LANGUAGES.includes(serverLanguage)) {
							setLanguageState(serverLanguage as Language);
							try {
								localStorage.setItem(
									"language",
									serverLanguage
								);
							} catch (e) {
								console.warn(
									"Could not save language to localStorage:",
									e
								);
							}
						}
					}
				} catch (error) {
					console.warn("Failed to load language from server:", error);
				} finally {
					isSyncingRef.current = false;
				}
			};

			loadLanguageFromServer();
		}
	}, [isAuthenticated]);

	useEffect(() => {
		try {
			localStorage.setItem("language", language);
		} catch (e) {
			console.warn("Could not save language to localStorage:", e);
		}
	}, [language]);

	const setLanguage = useCallback(
		async (lang: Language) => {
			setLanguageState(lang);

			// Sync to server if authenticated
			if (isAuthenticated) {
				try {
					await userService.updatePreferences({
						language: lang as "en" | "vi",
					});
				} catch (error) {
					console.warn("Failed to sync language to server:", error);
					// Continue with local language
				}
			}
		},
		[isAuthenticated]
	);

	const t = (key: string): string => {
		const langTranslations =
			flattenedTranslations[
				language as keyof typeof flattenedTranslations
			];
		const value = langTranslations[key as keyof typeof langTranslations];
		if (typeof value === "string") {
			return value;
		}
		return key;
	};

	const getNested = (key: string): unknown => {
		const langTranslations =
			nestedTranslations[language as keyof typeof nestedTranslations];
		const keys = key.split(".");
		let value: unknown = langTranslations;
		for (const k of keys) {
			if (value && typeof value === "object" && k in value) {
				value = (value as Record<string, unknown>)[k];
			} else {
				return undefined;
			}
		}
		return value;
	};

	return (
		<LanguageContext.Provider value={{language, setLanguage, t, getNested}}>
			{children}
		</LanguageContext.Provider>
	);
};
