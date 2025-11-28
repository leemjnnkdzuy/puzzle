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

export type SocialLoginProvider = "google" | "facebook" | "github" | "linkedin";
