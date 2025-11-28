import {useState, useCallback, useEffect, useRef} from "react";
import axios from "axios";
import {DEFAULT_API_URL} from "../configs/AppConfig";
import authService from "../services/AuthService";
import type {LoginResponse} from "../types/AuthTypes";

interface UseAuthReturn {
	login: (username: string, password: string) => Promise<LoginResponse>;
	logout: () => Promise<void>;
	refreshAccessToken: () => Promise<boolean>;
	isAuthenticated: boolean;
	token: string | null;
	user: unknown | null;
	loading: boolean;
}

interface UseAuthOptions {
	skipInitialCheck?: boolean;
}

const globalAuthState: {
	token: string | null;
	isAuthenticated: boolean;
	user: unknown | null;
	loading: boolean;
	hasChecked: boolean;
} = {
	token: null,
	isAuthenticated: false,
	user: null,
	loading: true,
	hasChecked: false,
};

let checkAuthPromise: Promise<void> | null = null;

export const useAuth = (options?: UseAuthOptions): UseAuthReturn => {
	const {skipInitialCheck = false} = options || {};
	const [token, setToken] = useState<string | null>(globalAuthState.token);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
		globalAuthState.isAuthenticated
	);
	const [user, setUser] = useState<unknown | null>(globalAuthState.user);
	const [loading, setLoading] = useState<boolean>(globalAuthState.loading);
	const hasCheckedRef = useRef<boolean>(globalAuthState.hasChecked);

	const login = useCallback(
		async (username: string, password: string): Promise<LoginResponse> => {
			try {
				const response = await axios.post<LoginResponse>(
					`${DEFAULT_API_URL}/api/auth/login`,
					{
						username,
						password,
					},
					{
						withCredentials: true,
					}
				);

				if (response.data.success) {
					globalAuthState.token = "authenticated";
					globalAuthState.isAuthenticated = true;
					setToken("authenticated");
					setIsAuthenticated(true);
					try {
						const userResult = await authService.getCurrentUser();
						if (userResult.success && userResult.data?.user) {
							globalAuthState.user = userResult.data.user;
							setUser(userResult.data.user);
						}
					} catch (error) {
						console.error("Failed to get user after login:", error);
					}
				}

				return response.data;
			} catch (error) {
				if (axios.isAxiosError(error)) {
					const message =
						error.response?.data?.message ||
						error.message ||
						"Đăng nhập thất bại!";
					return {
						success: false,
						message,
					};
				}
				return {
					success: false,
					message: "Đăng nhập thất bại!",
				};
			}
		},
		[]
	);

	const logout = useCallback(async () => {
		try {
			await authService.logout();
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			globalAuthState.token = null;
			globalAuthState.isAuthenticated = false;
			globalAuthState.user = null;
			globalAuthState.hasChecked = true;
			setToken(null);
			setIsAuthenticated(false);
			setUser(null);
		}
	}, []);

	const refreshAccessToken = useCallback(async (): Promise<boolean> => {
		try {
			const result = await authService.refreshToken();
			if (result.success) {
				globalAuthState.token = "authenticated";
				setToken("authenticated");
				return true;
			}
			return false;
		} catch (error) {
			console.error("Refresh token error:", error);
			return false;
		}
	}, []);

	const checkAuth = useCallback(async () => {
		if (checkAuthPromise && globalAuthState.hasChecked) {
			await checkAuthPromise;
			setToken(globalAuthState.token);
			setIsAuthenticated(globalAuthState.isAuthenticated);
			setUser(globalAuthState.user);
			setLoading(globalAuthState.loading);
			return;
		}

		if (globalAuthState.hasChecked) {
			setToken(globalAuthState.token);
			setIsAuthenticated(globalAuthState.isAuthenticated);
			setUser(globalAuthState.user);
			setLoading(globalAuthState.loading);
			return;
		}

		checkAuthPromise = (async () => {
			try {
				setLoading(true);
				globalAuthState.loading = true;

				const result = await authService.getCurrentUser();
				if (result.success && result.data?.user) {
					globalAuthState.user = result.data.user;
					globalAuthState.token = "authenticated";
					globalAuthState.isAuthenticated = true;
					setUser(globalAuthState.user);
					setToken(globalAuthState.token);
					setIsAuthenticated(globalAuthState.isAuthenticated);
				} else {
					const refreshed = await refreshAccessToken();
					if (refreshed) {
						const retryResult = await authService.getCurrentUser();
						if (retryResult.success && retryResult.data?.user) {
							globalAuthState.user = retryResult.data.user;
							globalAuthState.token = "authenticated";
							globalAuthState.isAuthenticated = true;
							setUser(globalAuthState.user);
							setToken(globalAuthState.token);
							setIsAuthenticated(globalAuthState.isAuthenticated);
						} else {
							globalAuthState.isAuthenticated = false;
							globalAuthState.token = null;
							globalAuthState.user = null;
							setIsAuthenticated(false);
							setToken(null);
							setUser(null);
						}
					} else {
						globalAuthState.isAuthenticated = false;
						globalAuthState.token = null;
						globalAuthState.user = null;
						setIsAuthenticated(false);
						setToken(null);
						setUser(null);
					}
				}
			} catch (error: unknown) {
				const isUnauthorized =
					axios.isAxiosError(error) && error.response?.status === 401;

				if (isUnauthorized) {
					globalAuthState.isAuthenticated = false;
					globalAuthState.token = null;
					globalAuthState.user = null;
					setIsAuthenticated(false);
					setToken(null);
					setUser(null);
				} else {
					console.error("Check auth error:", error);
					globalAuthState.isAuthenticated = false;
					globalAuthState.token = null;
					globalAuthState.user = null;
					setIsAuthenticated(false);
					setToken(null);
					setUser(null);
				}
			} finally {
				globalAuthState.loading = false;
				globalAuthState.hasChecked = true;
				hasCheckedRef.current = true;
				setLoading(false);
				checkAuthPromise = null;
			}
		})();

		await checkAuthPromise;
	}, [refreshAccessToken]);

	useEffect(() => {
		if (!skipInitialCheck && !hasCheckedRef.current) {
			checkAuth();
		} else if (skipInitialCheck) {
			if (globalAuthState.hasChecked) {
				setToken(globalAuthState.token);
				setIsAuthenticated(globalAuthState.isAuthenticated);
				setUser(globalAuthState.user);
				setLoading(globalAuthState.loading);
			} else {
				setLoading(false);
			}
		}
	}, [checkAuth, skipInitialCheck]);

	return {
		login,
		logout,
		refreshAccessToken,
		isAuthenticated,
		token,
		user,
		loading,
	};
};
