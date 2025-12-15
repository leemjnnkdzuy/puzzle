import {clsx} from "clsx";
import type {ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";
import type {RegisterData} from "@/services/AuthService";
import axios, {type AxiosInstance, type AxiosError} from "axios";
import {DEFAULT_API_URL} from "@/configs/AppConfig";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export interface PasswordRule {
	label: string;
	test: boolean;
}

export const calculatePasswordStrength = (pwd: string): number => {
	let strength = 0;
	if (pwd.length >= 6) strength++;
	if (/[A-Z]/.test(pwd)) strength++;
	if (/[a-z]/.test(pwd)) strength++;
	if (/[0-9]/.test(pwd)) strength++;
	if (/[^A-Za-z0-9]/.test(pwd)) strength++;
	return Math.min(strength, 4);
};

export const getPasswordRules = (
	password: string,
	t?: (key: string) => string
): PasswordRule[] => {
	const getLabel = (key: string, fallback: string) => {
		return t ? t(key) : fallback;
	};

	return [
		{
			label: getLabel(
				"signUp.passwordRules.minLength",
				"Ít nhất 6 ký tự"
			),
			test: password.length >= 6,
		},
		{
			label: getLabel("signUp.passwordRules.uppercase", "Có chữ hoa"),
			test: /[A-Z]/.test(password),
		},
		{
			label: getLabel("signUp.passwordRules.lowercase", "Có chữ thường"),
			test: /[a-z]/.test(password),
		},
		{
			label: getLabel("signUp.passwordRules.number", "Có số"),
			test: /[0-9]/.test(password),
		},
		{
			label: getLabel(
				"signUp.passwordRules.special",
				"Có ký tự đặc biệt"
			),
			test: /[^A-Za-z0-9]/.test(password),
		},
	];
};

export const getPasswordStrengthColor = (score: number): string => {
	const dotColors = ["#e74c3c", "#e67e22", "#f1c40f", "#2ecc71", "#27ae60"];
	return dotColors[score] || "#e74c3c";
};

export const validateRegisterField = (
	field: keyof RegisterData,
	value: string,
	password?: string,
	t?: (key: string) => string
): string | null => {
	const getError = (key: string, fallback: string) => {
		return t ? t(key) : fallback;
	};

	switch (field) {
		case "last_name":
			if (!value || value.trim().length < 2) {
				return getError(
					"signUp.errors.lastNameMin",
					"Họ phải có ít nhất 2 ký tự."
				);
			}
			break;
		case "first_name":
			if (!value || value.trim().length < 2) {
				return getError(
					"signUp.errors.firstNameMin",
					"Tên phải có ít nhất 2 ký tự."
				);
			}
			break;
		case "username":
			if (!value || value.length < 6) {
				return getError(
					"signUp.errors.usernameMin",
					"Tên người dùng phải có ít nhất 6 ký tự."
				);
			}
			if (!/^[a-z0-9_.-]+$/.test(value)) {
				return getError(
					"signUp.errors.usernameInvalid",
					"Tên người dùng chỉ được chứa các ký tự a-z, 0-9, dấu gạch dưới (_), gạch ngang (-) và dấu chấm (.)"
				);
			}
			break;
		case "email":
			if (!value || !/^\S+@\S+\.\S+$/.test(value)) {
				return getError(
					"signUp.errors.emailInvalid",
					"Email không hợp lệ. Vui lòng nhập đúng định dạng email."
				);
			}
			break;
		case "password":
			if (value) {
				const rules = getPasswordRules(value, t);
				for (const rule of rules) {
					if (!rule.test) {
						const errorKey = getError(
							"signUp.errors.passwordRule",
							"Mật khẩu: {rule}"
						);
						return errorKey.replace("{rule}", rule.label);
					}
				}
			}
			break;
		case "confirmPassword":
			if (value && password && value !== password) {
				return getError(
					"signUp.errors.passwordMismatch",
					"Mật khẩu không khớp!"
				);
			}
			break;
	}
	return null;
};

export const validateRegister = (
	data: RegisterData,
	t?: (key: string) => string
): string | null => {
	const getError = (key: string, fallback: string) => {
		return t ? t(key) : fallback;
	};

	if (!data.last_name || data.last_name.trim().length < 2) {
		return getError(
			"signUp.errors.lastNameMin",
			"Họ phải có ít nhất 2 ký tự."
		);
	}
	if (!data.first_name || data.first_name.trim().length < 2) {
		return getError(
			"signUp.errors.firstNameMin",
			"Tên phải có ít nhất 2 ký tự."
		);
	}
	if (!data.username || data.username.length < 6) {
		return getError(
			"signUp.errors.usernameMin",
			"Tên người dùng phải có ít nhất 6 ký tự."
		);
	}
	if (!/^[a-z0-9_.-]+$/.test(data.username)) {
		return getError(
			"signUp.errors.usernameInvalid",
			"Tên người dùng chỉ được chứa các ký tự a-z, 0-9, dấu gạch dưới (_), gạch ngang (-) và dấu chấm (.)"
		);
	}
	if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) {
		return getError(
			"signUp.errors.emailInvalidShort",
			"Email không hợp lệ."
		);
	}
	const passwordRules = getPasswordRules(data.password, t);
	for (const rule of passwordRules) {
		if (!rule.test) {
			const errorKey = getError(
				"signUp.errors.passwordRule",
				"Mật khẩu: {rule}"
			);
			return errorKey.replace("{rule}", rule.label);
		}
	}
	if (data.password !== data.confirmPassword) {
		return getError(
			"signUp.errors.passwordMismatch",
			"Mật khẩu không khớp!"
		);
	}
	return null;
};

export const formatCurrency = (value: number): string => {
	return new Intl.NumberFormat("vi-VN").format(value);
};

export const formatTime = (seconds: number): string => {
	if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const formatDurationHMS = (seconds: number): string => {
	if (!isFinite(seconds) || isNaN(seconds)) return "";
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = Math.floor(seconds % 60);

	if (h > 0) return `${h}h ${m}m ${s}s`;
	if (m > 0) return `${m}m ${s}s`;
	return `${s}s`;
};

export const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export const formatDate = (
	date: Date | string,
	includeYear: boolean = true
): string => {
	const d = new Date(date);
	return new Intl.DateTimeFormat("vi-VN", {
		year: includeYear ? "numeric" : undefined,
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	}).format(d);
};

export const formatReferenceCode = (code: string | undefined): string => {
	if (!code) return "-";
	return code.replace(/_/g, " ");
};

export const compressImage = (
	file: File,
	maxWidth: number = 800,
	maxHeight: number = 800,
	quality: number = 0.8
): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			const img = new Image();
			img.onload = () => {
				let width = img.width;
				let height = img.height;

				if (width > height) {
					if (width > maxWidth) {
						height = (height * maxWidth) / width;
						width = maxWidth;
					}
				} else {
					if (height > maxHeight) {
						width = (width * maxHeight) / height;
						height = maxHeight;
					}
				}

				const canvas = document.createElement("canvas");
				canvas.width = width;
				canvas.height = height;

				const ctx = canvas.getContext("2d");
				if (!ctx) {
					reject(new Error("Failed to get canvas context"));
					return;
				}

				ctx.drawImage(img, 0, 0, width, height);

				const base64String = canvas.toDataURL(file.type, quality);
				resolve(base64String);
			};
			img.onerror = () => {
				reject(new Error("Failed to load image"));
			};
			img.src = e.target?.result as string;
		};
		reader.onerror = () => {
			reject(new Error("Failed to read file"));
		};
		reader.readAsDataURL(file);
	});
};

let isLoggingOut = false;

export const setIsLoggingOut = (value: boolean) => {
	isLoggingOut = value;
};

export const getIsLoggingOut = () => isLoggingOut;

let isRefreshing = false;
let failedQueue: Array<{
	resolve: (value?: unknown) => void;
	reject: (reason?: unknown) => void;
}> = [];

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

				if (getIsLoggingOut()) {
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

export const getVideoThumbnail = (videoUrl: string): Promise<string> => {
	return new Promise((resolve, reject) => {
		const video = document.createElement("video");
		video.crossOrigin = "use-credentials";
		video.src = videoUrl;
		video.preload = "metadata";
		video.muted = true;

		video.onloadedmetadata = () => {
			video.currentTime = Math.min(
				1,
				video.duration > 0 ? video.duration / 2 : 0
			);
		};

		video.onloadeddata = () => {
			// Ensure we are ready to capture
			if (video.readyState >= 2) {
				// Waiting for seeked event
			}
		};

		video.onseeked = () => {
			const canvas = document.createElement("canvas");
			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;
			const ctx = canvas.getContext("2d");
			if (ctx) {
				ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
				try {
					const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
					resolve(dataUrl);
				} catch (e) {
					reject(e);
				}
			} else {
				reject(new Error("Failed to get canvas context"));
			}
		};

		video.onerror = () => {
			reject(new Error("Failed to load video"));
		};
	});
};

const apiClient = createApiClient();

export default apiClient;
