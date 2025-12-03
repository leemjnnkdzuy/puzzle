import {create} from "zustand";
import {useAuthStore} from "@/stores/authStore";
import geoLocationService from "@/services/GeoLocationService";
import userService from "@/services/UserService";
import {SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE} from "@/configs/AppConfig";
import type {Language} from "@/contexts/LanguageContext";

interface InitSteps {
	auth: boolean;
	geoLocation: boolean;
	preferences: boolean;
}

interface AppInitState {
	isInitializing: boolean;
	isInitialized: boolean;
	initError: string | null;
	initSteps: InitSteps;
}

interface AppInitActions {
	initializeApp: () => Promise<void>;
	setInitStep: (step: keyof InitSteps, completed: boolean) => void;
	resetInit: () => void;
}

type AppInitStore = AppInitState & AppInitActions;

const initialState: AppInitState = {
	isInitializing: false,
	isInitialized: false,
	initError: null,
	initSteps: {
		auth: false,
		geoLocation: false,
		preferences: false,
	},
};

export const useAppInitStore = create<AppInitStore>((set, get) => ({
	...initialState,

	setInitStep: (step: keyof InitSteps, completed: boolean) => {
		set((state) => ({
			initSteps: {
				...state.initSteps,
				[step]: completed,
			},
		}));
	},

	resetInit: () => {
		set(initialState);
	},

	initializeApp: async () => {
		const {isInitialized, isInitializing} = get();

		if (isInitialized || isInitializing) {
			return;
		}

		set({isInitializing: true, initError: null});

		try {
			const authStore = useAuthStore.getState();
			if (!authStore.isInitialized) {
				await authStore.checkAuth();
			}
			get().setInitStep("auth", true);

			const isAuthenticated = useAuthStore.getState().isAuthenticated;

			try {
				const savedLanguage = localStorage.getItem("language");

				if (
					!savedLanguage ||
					!SUPPORTED_LANGUAGES.includes(savedLanguage)
				) {
					const detectedLang =
						await geoLocationService.detectLanguageFromIP();

					if (
						detectedLang &&
						SUPPORTED_LANGUAGES.includes(detectedLang)
					) {
						localStorage.setItem("language", detectedLang);
						window.dispatchEvent(
							new CustomEvent("languageUpdated", {
								detail: detectedLang,
							})
						);
					} else {
						const defaultLang = DEFAULT_LANGUAGE as Language;
						localStorage.setItem("language", defaultLang);
						window.dispatchEvent(
							new CustomEvent("languageUpdated", {
								detail: defaultLang,
							})
						);
					}
				}
			} catch (error) {
				console.warn("Failed to initialize language:", error);
				const defaultLang = DEFAULT_LANGUAGE as Language;
				try {
					localStorage.setItem("language", defaultLang);
					window.dispatchEvent(
						new CustomEvent("languageUpdated", {
							detail: defaultLang,
						})
					);
				} catch (e) {
					console.warn("Could not save default language:", e);
				}
			}
			get().setInitStep("geoLocation", true);

			if (isAuthenticated) {
				try {
					const result = await userService.getPreferences();

					if (result.success && result.data) {
						if (
							result.data.language &&
							SUPPORTED_LANGUAGES.includes(result.data.language)
						) {
							localStorage.setItem(
								"language",
								result.data.language
							);
							window.dispatchEvent(
								new CustomEvent("languageUpdated", {
									detail: result.data.language,
								})
							);
						}

						if (
							result.data.theme === "light" ||
							result.data.theme === "dark"
						) {
							localStorage.setItem("theme", result.data.theme);
							window.dispatchEvent(
								new CustomEvent("themeUpdated", {
									detail: result.data.theme,
								})
							);
						}
					}
				} catch (error) {
					console.warn("Failed to load user preferences:", error);
				}
			}
			get().setInitStep("preferences", true);

			set({isInitializing: false, isInitialized: true});
		} catch (error) {
			console.error("App initialization failed:", error);
			const errorMessage =
				error instanceof Error
					? error.message
					: "Initialization failed";
			set({
				isInitializing: false,
				isInitialized: true,
				initError: errorMessage,
			});
		}
	},
}));
