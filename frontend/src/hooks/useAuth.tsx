import {useEffect} from "react";
import {useAuthStore} from "@/stores/authStore";
import type {LoginResponse} from "@/services/AuthService";

interface UseAuthReturn {
	login: (username: string, password: string) => Promise<LoginResponse>;
	logout: () => Promise<void>;
	refreshAccessToken: () => Promise<boolean>;
	isAuthenticated: boolean;
	token: string | null;
	user: unknown | null;
	loading: boolean;
	hasChecked: boolean;
}

interface UseAuthOptions {
	skipInitialCheck?: boolean;
}

export const useAuth = (options?: UseAuthOptions): UseAuthReturn => {
	const {skipInitialCheck = false} = options || {};

	const user = useAuthStore((state) => state.user);
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const loading = useAuthStore((state) => state.loading);
	const isInitialized = useAuthStore((state) => state.isInitialized);
	const login = useAuthStore((state) => state.login);
	const logout = useAuthStore((state) => state.logout);
	const refreshToken = useAuthStore((state) => state.refreshToken);
	const checkAuth = useAuthStore((state) => state.checkAuth);

	// Initialize auth check on mount if needed
	useEffect(() => {
		if (!skipInitialCheck && !isInitialized) {
			checkAuth();
		}
	}, [skipInitialCheck, isInitialized, checkAuth]);

	const refreshAccessToken = async (): Promise<boolean> => {
		return refreshToken();
	};

	return {
		login,
		logout,
		refreshAccessToken,
		isAuthenticated,
		token: isAuthenticated ? "authenticated" : null,
		user,
		loading,
		hasChecked: isInitialized,
	};
};
