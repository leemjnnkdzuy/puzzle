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
}

const userService = new UserService();

export default userService;
