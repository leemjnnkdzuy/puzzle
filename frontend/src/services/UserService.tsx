import axios, {type AxiosInstance, type AxiosError} from "axios";
import {DEFAULT_API_URL} from "@/configs/AppConfig";

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
			throw new Error(message);
		}
	);

	return api;
};

const api = createApiClient();

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
		const response = await api.get<PreferencesResponse>(
			"/api/user/preferences"
		);
		return response.data;
	}

	async updatePreferences(data: {
		theme?: "light" | "dark";
		language?: "en" | "vi";
	}): Promise<PreferencesResponse> {
		const response = await api.put<PreferencesResponse>(
			"/api/user/preferences",
			data
		);
		return response.data;
	}
}

const userService = new UserService();

export default userService;
