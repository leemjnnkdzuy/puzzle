import apiClient from "@/utils";
import type {AxiosError} from "axios";

export interface StorageInfo {
	limit: number;
	used: number;
	available: number;
	limitFormatted: string;
	usedFormatted: string;
	availableFormatted: string;
	credit: number;
}

export interface ProjectStorage {
	id: string;
	title: string;
	type: "script_generation" | "script_voice" | "full_service";
	storageUsed: number;
	storageUsedFormatted: string;
	createdAt: string;
}

class StorageService {
	private baseUrl = "/api/storage";

	async getStorageInfo(): Promise<StorageInfo> {
		try {
			const response = await apiClient.get<{
				success: boolean;
				data: StorageInfo;
				message?: string;
			}>(`${this.baseUrl}`);

			return response.data.data;
		} catch (error) {
			const axiosError = error as AxiosError<{message?: string}>;
			const errorMessage =
				axiosError.response?.data?.message ||
				axiosError.message ||
				"Failed to fetch storage info";
			throw new Error(errorMessage);
		}
	}

	async getProjectsStorage(): Promise<ProjectStorage[]> {
		try {
			const response = await apiClient.get<{
				success: boolean;
				data: ProjectStorage[];
				message?: string;
			}>(`${this.baseUrl}/projects`);

			return response.data.data || [];
		} catch (error) {
			const axiosError = error as AxiosError<{message?: string}>;
			const errorMessage =
				axiosError.response?.data?.message ||
				axiosError.message ||
				"Failed to fetch projects storage";
			throw new Error(errorMessage);
		}
	}

	async upgradeStorage(amountGB: number): Promise<StorageInfo> {
		try {
			const response = await apiClient.post<{
				success: boolean;
				data: StorageInfo;
				message?: string;
			}>(`${this.baseUrl}/upgrade`, {amountGB});

			return response.data.data;
		} catch (error) {
			const axiosError = error as AxiosError<{message?: string}>;
			const errorMessage =
				axiosError.response?.data?.message ||
				axiosError.message ||
				"Failed to upgrade storage";
			throw new Error(errorMessage);
		}
	}
}

export default new StorageService();
