import React, {
	useState,
	useEffect,
	type ReactNode,
	useCallback,
	useRef,
	createContext,
} from "react";
import userService from "@/services/UserService";

export type Theme = "light" | "dark";

export interface ThemeContextType {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	toggleTheme: () => void;
	isDark: boolean;
	isLight: boolean;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
	undefined
);

const THEME_STORAGE_KEY = "theme";

const getInitialTheme = (): Theme => {
	try {
		const saved = localStorage.getItem(THEME_STORAGE_KEY);
		if (saved === "light" || saved === "dark") {
			return saved;
		}
	} catch (e) {
		console.warn("Could not access localStorage:", e);
	}

	return "light";
};

const applyTheme = (theme: Theme) => {
	const root = document.documentElement;
	if (theme === "dark") {
		root.classList.remove("light");
		root.classList.add("dark");
	} else {
		root.classList.remove("dark");
		root.classList.add("light");
	}
};

interface ThemeProviderProps {
	children: ReactNode;
	isAuthenticated?: boolean;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
	children,
	isAuthenticated = false,
}) => {
	const [theme, setThemeState] = useState<Theme>(() => {
		const initialTheme = getInitialTheme();
		applyTheme(initialTheme);
		return initialTheme;
	});
	const isSyncingRef = useRef(false);

	useEffect(() => {
		if (isAuthenticated) {
			const loadThemeFromServer = async () => {
				if (isSyncingRef.current) return;
				try {
					isSyncingRef.current = true;
					const result = await userService.getPreferences();
					if (result.success && result.data?.theme) {
						const serverTheme = result.data.theme;
						setThemeState(serverTheme);
						try {
							localStorage.setItem(
								THEME_STORAGE_KEY,
								serverTheme
							);
						} catch (e) {
							console.warn(
								"Could not save theme to localStorage:",
								e
							);
						}
					}
				} catch (error) {
					console.warn("Failed to load theme from server:", error);
				} finally {
					isSyncingRef.current = false;
				}
			};

			loadThemeFromServer();
		}
	}, [isAuthenticated]);

	useEffect(() => {
		applyTheme(theme);
		try {
			localStorage.setItem(THEME_STORAGE_KEY, theme);
		} catch (e) {
			console.warn("Could not save theme to localStorage:", e);
		}
	}, [theme]);

	const setTheme = useCallback(
		async (newTheme: Theme) => {
			setThemeState(newTheme);

			if (isAuthenticated) {
				try {
					await userService.updatePreferences({theme: newTheme});
				} catch (error) {
					console.warn("Failed to sync theme to server:", error);
				}
			}
		},
		[isAuthenticated]
	);

	const toggleTheme = useCallback(() => {
		const newTheme = theme === "light" ? "dark" : "light";
		setTheme(newTheme);
	}, [theme, setTheme]);

	return (
		<ThemeContext.Provider
			value={{
				theme,
				setTheme,
				toggleTheme,
				isDark: theme === "dark",
				isLight: theme === "light",
			}}
		>
			{children}
		</ThemeContext.Provider>
	);
};
