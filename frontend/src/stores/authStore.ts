import {create} from "zustand";
import {persist, createJSONStorage} from "zustand/middleware";
import axios from "axios";
import {DEFAULT_API_URL} from "@/configs/AppConfig";
import authService from "@/services/AuthService";
import {safeExecute} from "@/handlers/errorHandler";
import type {LoginResponse} from "@/services/AuthService";

interface AuthState {
	user: unknown | null;
	isAuthenticated: boolean;
	loading: boolean;
	isInitialized: boolean;
}

interface AuthActions {
	login: (username: string, password: string) => Promise<LoginResponse>;
	logout: () => Promise<void>;
	silentLogout: () => void;
	setUser: (user: unknown | null) => void;
	updateUserCredit: (credit: number) => void;
	checkAuth: () => Promise<void>;
	refreshToken: () => Promise<boolean>;
	setLoading: (loading: boolean) => void;
	reset: () => void;
}

type AuthStore = AuthState & AuthActions;

const STORAGE_KEY = "auth-storage";

const initialState: AuthState = {
	user: null,
	isAuthenticated: false,
	loading: false,
	isInitialized: false,
};

export const useAuthStore = create<AuthStore>()(
	persist(
		(set, get) => ({
			...initialState,

			setLoading: (loading: boolean) => {
				set({loading});
			},

			setUser: (user: unknown | null) => {
				set({user, isAuthenticated: user !== null});
			},

			updateUserCredit: (credit: number) => {
				const currentUser = get().user;
				if (currentUser && typeof currentUser === "object") {
					set({
						user: {
							...currentUser,
							credit: credit,
						},
					});
				} else {
					console.warn("Cannot update credit: user is not available");
				}
			},

			login: async (username: string, password: string) => {
				try {
					set({loading: true});
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
						const userResult = await safeExecute(
							() => authService.getCurrentUser(),
							{silent: true}
						);
						if (userResult?.success && userResult.data?.user) {
							set({
								user: userResult.data.user,
								isAuthenticated: true,
								loading: false,
								isInitialized: true,
							});
						} else {
							set({
								isAuthenticated: true,
								loading: false,
								isInitialized: true,
							});
						}
					} else {
						set({loading: false});
					}

					return response.data;
				} catch (error) {
					set({loading: false});
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

			logout: async () => {
				if (isLoggingOut) {
					return;
				}
				await safeExecute(() => authService.logout(), {silent: true});
				set({
					user: null,
					isAuthenticated: false,
					loading: false,
					isInitialized: true,
				});
			},

			silentLogout: () => {
				if (isLoggingOut) {
					return;
				}
				isLoggingOut = true;
				stopAutoRefresh();
				import("@/utils/axiosInstance").then((module) => {
					module.setIsLoggingOut(true);
				});
				set({
					user: null,
					isAuthenticated: false,
					loading: false,
					isInitialized: true,
				});
				setTimeout(() => {
					isLoggingOut = false;
					import("@/utils/axiosInstance").then((module) => {
						module.setIsLoggingOut(false);
					});
				}, 1000);
			},

			refreshToken: async (): Promise<boolean> => {
				const result = await safeExecute(
					() => authService.refreshToken(),
					{silent: true}
				);
				return result?.success ?? false;
			},

			checkAuth: async () => {
				const {isInitialized} = get();
				if (isInitialized) {
					return;
				}

				try {
					set({loading: true});
					const result = await authService.getCurrentUser();
					if (result.success && result.data?.user) {
						set({
							user: result.data.user,
							isAuthenticated: true,
							loading: false,
							isInitialized: true,
						});
					} else {
						const refreshed = await get().refreshToken();
						if (refreshed) {
							const retryResult =
								await authService.getCurrentUser();
							if (retryResult.success && retryResult.data?.user) {
								set({
									user: retryResult.data.user,
									isAuthenticated: true,
									loading: false,
									isInitialized: true,
								});
							} else {
								set({
									user: null,
									isAuthenticated: false,
									loading: false,
									isInitialized: true,
								});
							}
						} else {
							set({
								user: null,
								isAuthenticated: false,
								loading: false,
								isInitialized: true,
							});
						}
					}
				} catch (error: unknown) {
					const isUnauthorized =
						axios.isAxiosError(error) &&
						error.response?.status === 401;

					if (isUnauthorized) {
						const refreshed = await get().refreshToken();
						if (refreshed) {
							const retryResult = await safeExecute(
								() => authService.getCurrentUser(),
								{silent: true}
							);
							if (
								retryResult?.success &&
								retryResult.data?.user
							) {
								set({
									user: retryResult.data.user,
									isAuthenticated: true,
									loading: false,
									isInitialized: true,
								});
								return;
							}
						}
					}

					set({
						user: null,
						isAuthenticated: false,
						loading: false,
						isInitialized: true,
					});
				}
			},

			reset: () => {
				set(initialState);
			},
		}),
		{
			name: STORAGE_KEY,
			storage: createJSONStorage(() => sessionStorage),
			partialize: (state) => ({
				isAuthenticated: state.isAuthenticated,
				user: state.user,
				isInitialized: state.isInitialized,
			}),
		}
	)
);

const TOKEN_REFRESH_INTERVAL = 14 * 60 * 1000;

let refreshInterval: ReturnType<typeof setInterval> | null = null;
let isLoggingOut = false;

const startAutoRefresh = () => {
	if (refreshInterval) {
		clearInterval(refreshInterval);
	}

	refreshInterval = setInterval(async () => {
		if (isLoggingOut) {
			return;
		}
		const {isAuthenticated} = useAuthStore.getState();
		if (isAuthenticated) {
			await useAuthStore.getState().refreshToken();
		}
	}, TOKEN_REFRESH_INTERVAL);
};

const stopAutoRefresh = () => {
	if (refreshInterval) {
		clearInterval(refreshInterval);
		refreshInterval = null;
	}
};

let previousIsAuthenticated: boolean | undefined = undefined;
useAuthStore.subscribe((state) => {
	const isAuthenticated = state.isAuthenticated;
	if (isAuthenticated !== previousIsAuthenticated) {
		previousIsAuthenticated = isAuthenticated;
		if (isAuthenticated) {
			startAutoRefresh();
		} else {
			stopAutoRefresh();
		}
	}
});

if (typeof window !== "undefined") {
	window.addEventListener("storage", (e) => {
		if (e.key === STORAGE_KEY && e.newValue) {
			safeExecute(
				async () => {
					const newState = JSON.parse(e.newValue || "{}");
					useAuthStore.setState({
						isAuthenticated:
							newState.state?.isAuthenticated ?? false,
						user: newState.state?.user ?? null,
						isInitialized: newState.state?.isInitialized ?? false,
					});
				},
				{silent: true}
			);
		}
	});

	if (useAuthStore.getState().isAuthenticated) {
		startAutoRefresh();
	}
}
