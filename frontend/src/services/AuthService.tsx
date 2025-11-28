import axios, {type AxiosInstance, type AxiosError} from "axios";
import {DEFAULT_API_URL} from "@/configs/AppConfig";
import {RequestError} from "@/utils/RequestError";
import type {
	RegisterData,
	ForgotPasswordData,
	ResetPasswordRequest,
	VerifyResponse,
	VerifyResetPinResponse,
	RegisterResponse,
} from "@/types/AuthTypes";

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
		(error: AxiosError<{message?: string}>) => {
			const message =
				error.response?.data?.message ||
				error.message ||
				"Đã xảy ra lỗi không xác định";
			throw new RequestError(message);
		}
	);

	return api;
};

const api = createApiClient();

class AuthService {
	async register(data: RegisterData): Promise<RegisterResponse> {
		const {confirmPassword, ...registerData} = data;
		void confirmPassword;
		const response = await api.post<RegisterResponse>(
			"/api/auth/register",
			registerData
		);
		return response.data;
	}

	async forgotPassword(
		data: ForgotPasswordData
	): Promise<{success: boolean; message?: string}> {
		const response = await api.post<{success: boolean; message?: string}>(
			"/api/auth/forgot-password",
			data
		);
		return response.data;
	}

	async resetPassword(
		data: ResetPasswordRequest
	): Promise<{success: boolean; message?: string}> {
		const {confirmPassword, ...resetData} = data;
		void confirmPassword;
		const response = await api.post<{success: boolean; message?: string}>(
			"/api/auth/reset-password",
			resetData
		);
		return response.data;
	}

	async verify(code: string): Promise<VerifyResponse> {
		const response = await api.post<VerifyResponse>("/api/auth/verify", {
			code,
		});
		return response.data;
	}

	async verifyResetPin(data: {
		email: string;
		code: string;
	}): Promise<VerifyResetPinResponse> {
		const response = await api.post<VerifyResetPinResponse>(
			"/api/auth/verify-reset-pin",
			data
		);
		return response.data;
	}

	async refreshToken(): Promise<{
		success: boolean;
		data?: {accessToken: string};
		message?: string;
	}> {
		const response = await api.post<{
			success: boolean;
			data?: {accessToken: string};
			message?: string;
		}>("/api/auth/refresh-token", {});
		return response.data;
	}

	async logout(): Promise<{success: boolean; message?: string}> {
		const response = await api.post<{success: boolean; message?: string}>(
			"/api/auth/logout"
		);
		return response.data;
	}

	async getCurrentUser(): Promise<{
		success: boolean;
		data?: {user: unknown};
		message?: string;
	}> {
		const response = await api.get<{
			success: boolean;
			data?: {user: unknown};
			message?: string;
		}>("/api/auth/me");
		return response.data;
	}
}

const authService = new AuthService();

export default authService;
