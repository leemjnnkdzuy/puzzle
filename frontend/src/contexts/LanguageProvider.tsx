import React, {useState, useEffect} from "react";
import type {ReactNode} from "react";
import {LanguageContext} from "./LanguageContext";
import type {Language} from "../types/LanguageContextType";
import {DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES} from "../configs/AppConfig";
import enTranslations from "../lang/en.json";
import viTranslations from "../lang/vi.json";

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

export const LanguageProvider: React.FC<{children: ReactNode}> = ({
	children,
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

	useEffect(() => {
		try {
			localStorage.setItem("language", language);
		} catch (e) {
			console.warn("Could not save language to localStorage:", e);
		}
	}, [language]);

	const setLanguage = (lang: Language) => {
		setLanguageState(lang);
	};

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
