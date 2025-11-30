import apiConfig from "@/configs/AppConfig";
import apiClient from "@/utils/axiosInstance";
import type {AxiosError} from "axios";

export interface FullServiceProject {
	_id: string;
	title: string;
	description: string;
	thumbnail?: string;
	userId: string;
	status: "pending" | "processing" | "completed" | "failed";
	scriptContent?: string;
	videoUrl?: string;
	audioUrl?: string;
	videoDuration?: number;
	audioDuration?: number;
	generationSettings?: {
		tone?: string;
		style?: string;
		length?: string;
	};
	voiceSettings?: {
		voiceId?: string;
		voiceName?: string;
		speed?: number;
		pitch?: number;
		volume?: number;
	};
	language?: string;
	processingSteps?: {
		scriptGeneration?: "pending" | "processing" | "completed" | "failed";
		voiceGeneration?: "pending" | "processing" | "completed" | "failed";
		videoGeneration?: "pending" | "processing" | "completed" | "failed";
	};
	createdAt: string;
	updatedAt: string;
}

export interface CreateFullServiceData {
	title: string;
	description: string;
	generationSettings?: {
		tone?: string;
		style?: string;
		length?: string;
	};
	voiceSettings?: {
		voiceId?: string;
		voiceName?: string;
		speed?: number;
		pitch?: number;
		volume?: number;
	};
	language?: string;
}

class FullServiceService {
	private baseUrl = `${apiConfig.apiBaseUrl}/full-service`;

	async getProjects(): Promise<FullServiceProject[]> {
		try {
			const response = await apiClient.get<{
				success: boolean;
				data: FullServiceProject[];
				message?: string;
			}>(this.baseUrl);

			return response.data.data || [];
		} catch (error) {
			const axiosError = error as AxiosError<{message?: string}>;
			const errorMessage =
				axiosError.response?.data?.message ||
				axiosError.message ||
				"Failed to fetch projects";
			throw new Error(errorMessage);
		}
	}

	async createProject(
		projectData: CreateFullServiceData
	): Promise<FullServiceProject> {
		try {
			const response = await apiClient.post<{
				success: boolean;
				data: FullServiceProject;
				message?: string;
			}>(this.baseUrl, projectData);

			return response.data.data;
		} catch (error) {
			const axiosError = error as AxiosError<{message?: string}>;
			const errorMessage =
				axiosError.response?.data?.message ||
				axiosError.message ||
				"Failed to create project";
			throw new Error(errorMessage);
		}
	}

	async getProjectById(id: string): Promise<FullServiceProject> {
		try {
			const response = await apiClient.get<{
				success: boolean;
				data: FullServiceProject;
				message?: string;
			}>(`${this.baseUrl}/${id}`);

			return response.data.data;
		} catch (error) {
			const axiosError = error as AxiosError<{message?: string}>;
			const errorMessage =
				axiosError.response?.data?.message ||
				axiosError.message ||
				"Failed to fetch project";
			throw new Error(errorMessage);
		}
	}

	async updateProject(
		id: string,
		updateData: Partial<FullServiceProject>
	): Promise<FullServiceProject> {
		try {
			const response = await apiClient.put<{
				success: boolean;
				data: FullServiceProject;
				message?: string;
			}>(`${this.baseUrl}/${id}`, updateData);

			return response.data.data;
		} catch (error) {
			const axiosError = error as AxiosError<{message?: string}>;
			const errorMessage =
				axiosError.response?.data?.message ||
				axiosError.message ||
				"Failed to update project";
			throw new Error(errorMessage);
		}
	}

	async deleteProject(id: string): Promise<void> {
		try {
			await apiClient.delete<{
				success: boolean;
				message?: string;
			}>(`${this.baseUrl}/${id}`);
		} catch (error) {
			const axiosError = error as AxiosError<{message?: string}>;
			const errorMessage =
				axiosError.response?.data?.message ||
				axiosError.message ||
				"Failed to delete project";
			throw new Error(errorMessage);
		}
	}
}

export default new FullServiceService();
