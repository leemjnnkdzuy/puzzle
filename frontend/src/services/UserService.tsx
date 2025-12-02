import apiClient from "@/utils/axiosInstance";

interface PreferencesResponse {
	success: boolean;
	data?: {
		theme: "light" | "dark";
		language: "en" | "vi";
	};
	message?: string;
}

class UserService {
	async getPreferences(): Promise<PreferencesResponse> {
		const response = await apiClient.get<PreferencesResponse>(
			"/api/user/preferences"
		);
		return response.data;
	}

	async updatePreferences(data: {
		theme?: "light" | "dark";
		language?: "en" | "vi";
	}): Promise<PreferencesResponse> {
		const response = await apiClient.put<PreferencesResponse>(
			"/api/user/preferences",
			data
		);
		return response.data;
	}

	async changePassword(data: {
		currentPassword: string;
		newPassword: string;
	}): Promise<{success: boolean; message?: string}> {
		const response = await apiClient.put<{
			success: boolean;
			message?: string;
		}>("/api/user/change-password", data);
		return response.data;
	}

	async requestChangeEmailCurrent(): Promise<{
		success: boolean;
		message?: string;
	}> {
		const response = await apiClient.post<{
			success: boolean;
			message?: string;
		}>("/api/user/change-email/request-current");
		return response.data;
	}

	async verifyChangeEmailCurrent(code: string): Promise<{
		success: boolean;
		message?: string;
		data?: {tempToken: string};
	}> {
		const response = await apiClient.post<{
			success: boolean;
			message?: string;
			data?: {tempToken: string};
		}>("/api/user/change-email/verify-current", {code});
		return response.data;
	}

	async requestChangeEmailNew(data: {
		newEmail: string;
		tempToken: string;
	}): Promise<{success: boolean; message?: string}> {
		const response = await apiClient.post<{
			success: boolean;
			message?: string;
		}>("/api/user/change-email/request-new", data);
		return response.data;
	}

	async verifyChangeEmailNew(data: {
		code: string;
		newEmail: string;
	}): Promise<{
		success: boolean;
		message?: string;
		data?: {email: string};
	}> {
		const response = await apiClient.post<{
			success: boolean;
			message?: string;
			data?: {email: string};
		}>("/api/user/change-email/verify-new", data);
		return response.data;
	}

	async checkUsername(username: string): Promise<{
		success: boolean;
		available: boolean;
		message?: string;
	}> {
		const response = await apiClient.post<{
			success: boolean;
			available: boolean;
			message?: string;
		}>("/api/user/change-username/check", {username});
		return response.data;
	}

	async requestChangeUsername(): Promise<{
		success: boolean;
		message?: string;
	}> {
		const response = await apiClient.post<{
			success: boolean;
			message?: string;
		}>("/api/user/change-username/request");
		return response.data;
	}

	async verifyChangeUsername(data: {
		username: string;
		code: string;
	}): Promise<{
		success: boolean;
		message?: string;
		data?: {username: string};
	}> {
		const response = await apiClient.post<{
			success: boolean;
			message?: string;
			data?: {username: string};
		}>("/api/user/change-username/verify", data);
		return response.data;
	}
}

const userService = new UserService();

export default userService;
