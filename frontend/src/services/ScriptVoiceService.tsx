import apiConfig from "@/configs/AppConfig";
import apiClient from "@/utils/axiosInstance";
import type {AxiosError} from "axios";

export interface ScriptVoiceProject {
	_id: string;
	title: string;
	description: string;
	thumbnail?: string;
	userId: string;
	status: "pending" | "processing" | "completed" | "failed";
	scriptContent?: string;
	voiceSettings?: {
		voiceId?: string;
		voiceName?: string;
		speed?: number;
		pitch?: number;
		volume?: number;
	};
	audioUrl?: string;
	audioDuration?: number;
	language?: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateScriptVoiceData {
	title: string;
	description: string;
	scriptContent?: string;
	voiceSettings?: {
		voiceId?: string;
		voiceName?: string;
		speed?: number;
		pitch?: number;
		volume?: number;
	};
	language?: string;
}

class ScriptVoiceService {
	private baseUrl = `${apiConfig.apiBaseUrl}/script-voice`;

	async getProjects(): Promise<ScriptVoiceProject[]> {
		try {
			const response = await apiClient.get<{
				success: boolean;
				data: ScriptVoiceProject[];
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
		projectData: CreateScriptVoiceData
	): Promise<ScriptVoiceProject> {
		try {
			const response = await apiClient.post<{
				success: boolean;
				data: ScriptVoiceProject;
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

	async getProjectById(id: string): Promise<ScriptVoiceProject> {
		try {
			const response = await apiClient.get<{
				success: boolean;
				data: ScriptVoiceProject;
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
		updateData: Partial<ScriptVoiceProject>
	): Promise<ScriptVoiceProject> {
		try {
			const response = await apiClient.put<{
				success: boolean;
				data: ScriptVoiceProject;
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

export default new ScriptVoiceService();
