import apiClient from "@/utils/axiosInstance";
import type {AxiosInstance, AxiosError} from "axios";

export type AuthPhase =
	| "login"
	| "register"
	| "forgotPassword"
	| "verification"
	| "resetPassword";

export interface LoginData {
	username: string;
	password: string;
}

export interface RegisterData {
	first_name: string;
	last_name: string;
	username: string;
	email: string;
	password: string;
	confirmPassword: string;
}

export interface ForgotPasswordData {
	email: string;
}

export interface ResetPasswordData {
	password: string;
	confirmPassword: string;
}

export interface VerificationData {
	code: string;
}

export interface LoginResponse {
	success: boolean;
	message?: string;
	token?: string;
	data?: {
		accessToken: string;
		refreshToken: string;
		user: unknown;
	};
	user?: unknown;
}

export interface RegisterResponse {
	success: boolean;
	message?: string;
}

export interface VerifyResponse {
	success: boolean;
	message?: string;
}

export interface VerifyResetPinResponse {
	success: boolean;
	message?: string;
	resetToken?: string;
}

export interface ResetPasswordRequest {
	password: string;
	confirmPassword: string;
	resetToken: string;
}

export type SocialLoginProvider = "google" | "facebook";

const api = apiClient;

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
	): Promise<{success: boolean; message?: string; emailNotFound?: boolean}> {
		const response = await api.post<{
			success: boolean;
			message?: string;
			emailNotFound?: boolean;
		}>("/api/auth/forgot-password", data);
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
