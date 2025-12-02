import axios, {type AxiosInstance, type AxiosError} from "axios";
import {DEFAULT_API_URL} from "@/configs/AppConfig";

let isRefreshing = false;
let failedQueue: Array<{
	resolve: (value?: unknown) => void;
	reject: (reason?: unknown) => void;
}> = [];
let isLoggingOut = false;

export const setIsLoggingOut = (value: boolean) => {
	isLoggingOut = value;
};

export const getIsLoggingOut = () => isLoggingOut;

const processQueue = (error: unknown | null, token: string | null = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	});

	failedQueue = [];
};

const createApiClient = (): AxiosInstance => {
	const api = axios.create({
		baseURL: DEFAULT_API_URL,
		headers: {
			"Content-Type": "application/json",
		},
		withCredentials: true,
	});

	api.interceptors.request.use(
		(config) => {
			return config;
		},
		(error) => {
			return Promise.reject(error);
		}
	);

	api.interceptors.response.use(
		(response) => response,
		async (error: AxiosError<{message?: string}>) => {
			const originalRequest = error.config as
				| (AxiosError["config"] & {_retry?: boolean})
				| undefined;

			if (
				error.response?.status === 401 &&
				originalRequest &&
				!originalRequest._retry &&
				!originalRequest.url?.includes("/api/auth/refresh-token") &&
				!originalRequest.url?.includes("/api/auth/login") &&
				!originalRequest.url?.includes("/api/auth/logout") &&
				!originalRequest.url?.includes("/api/auth/register") &&
				!originalRequest.url?.includes("/api/auth/validate-session")
			) {
				const errorMessage = error.response?.data?.message || "";
				const isSessionRevoked =
					errorMessage.includes("Session has been revoked") ||
					errorMessage.includes("Session is not active") ||
					errorMessage.includes("Token has been revoked");

				if (isSessionRevoked) {
					const {useAuthStore} = await import("@/stores/authStore");
					useAuthStore.getState().silentLogout();
					window.location.href = "/";
					return Promise.reject(error);
				}

				if (isLoggingOut) {
					return Promise.reject(error);
				}

				if (isRefreshing) {
					return new Promise((resolve, reject) => {
						failedQueue.push({resolve, reject});
					})
						.then(() => {
							return api(originalRequest);
						})
						.catch((err) => {
							return Promise.reject(err);
						});
				}

				originalRequest._retry = true;
				isRefreshing = true;

				try {
					const refreshResponse = await api.post<{
						success: boolean;
						message?: string;
					}>("/api/auth/refresh-token", {});

					if (refreshResponse.data.success) {
						processQueue(null, null);
						return api(originalRequest);
					} else {
						processQueue(new Error("Token refresh failed"), null);
						throw new Error("Token refresh failed");
					}
				} catch (refreshError) {
					processQueue(refreshError, null);
					const refreshErrorMessage =
						axios.isAxiosError(refreshError) &&
						refreshError.response?.data?.message
							? refreshError.response.data.message
							: "";
					const isRefreshSessionRevoked =
						refreshErrorMessage.includes(
							"Session has been revoked"
						) ||
						refreshErrorMessage.includes("Session is not active") ||
						refreshErrorMessage.includes("A newer session exists");

					if (isRefreshSessionRevoked) {
						const {useAuthStore} = await import(
							"@/stores/authStore"
						);
						useAuthStore.getState().silentLogout();
						window.location.href = "/";
					}

					const message =
						error.response?.data?.message ||
						error.message ||
						"Đã xảy ra lỗi không xác định";
					throw new Error(message);
				} finally {
					isRefreshing = false;
				}
			}

			const message =
				error.response?.data?.message ||
				error.message ||
				"Đã xảy ra lỗi không xác định";
			throw new Error(message);
		}
	);

	return api;
};

const apiClient = createApiClient();

export default apiClient;
