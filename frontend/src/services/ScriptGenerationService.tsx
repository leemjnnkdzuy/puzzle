import apiConfig from "@/configs/AppConfig";
import apiClient from "@/utils/axiosInstance";
import type {AxiosError} from "axios";

export interface ScriptGenerationProject {
	_id: string;
	title: string;
	description: string;
	thumbnail?: string;
	userId: string;
	status: "pending" | "processing" | "completed" | "failed";
	scriptContent?: string;
	scriptLanguage?: string;
	videoUrl?: string;
	videoDuration?: number;
	generationSettings?: {
		tone?: string;
		style?: string;
		length?: string;
	};
	createdAt: string;
	updatedAt: string;
}

export interface CreateScriptGenerationData {
	title: string;
	description: string;
	videoUrl?: string;
	videoDuration?: number;
	generationSettings?: {
		tone?: string;
		style?: string;
		length?: string;
	};
}

class ScriptGenerationService {
	private baseUrl = `${apiConfig.apiBaseUrl}/script-generation`;

	async getProjects(): Promise<ScriptGenerationProject[]> {
		try {
			const response = await apiClient.get<{
				success: boolean;
				data: ScriptGenerationProject[];
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
		projectData: CreateScriptGenerationData
	): Promise<ScriptGenerationProject> {
		try {
			const response = await apiClient.post<{
				success: boolean;
				data: ScriptGenerationProject;
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

	async getProjectById(id: string): Promise<ScriptGenerationProject> {
		try {
			const response = await apiClient.get<{
				success: boolean;
				data: ScriptGenerationProject;
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
		updateData: Partial<ScriptGenerationProject>
	): Promise<ScriptGenerationProject> {
		try {
			const response = await apiClient.put<{
				success: boolean;
				data: ScriptGenerationProject;
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

export default new ScriptGenerationService();
