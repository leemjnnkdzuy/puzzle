import apiConfig from "@/configs/AppConfig";
import apiClient from "@/utils";
import type {AxiosError} from "axios";

export interface VideoFile {
	filename: string;
	originalName: string;
	size: number;
	mimetype: string;
	order: number;
	uploadedAt: string;
	width?: number;
	height?: number;
	duration?: number;
	fps?: number;
	bitrate?: number;
	codec?: string;
	format?: string;
}

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
	uploadedVideos?: VideoFile[];
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

	async uploadVideo(
		projectId: string,
		file: File,
		order: number
	): Promise<VideoFile> {
		try {
			const formData = new FormData();
			formData.append("video", file);
			formData.append("order", order.toString());

			const response = await apiClient.post<{
				success: boolean;
				data: VideoFile;
				message?: string;
			}>(`${this.baseUrl}/${projectId}/videos/upload`, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			return response.data.data;
		} catch (error) {
			const axiosError = error as AxiosError<{message?: string}>;
			const errorMessage =
				axiosError.response?.data?.message ||
				axiosError.message ||
				"Failed to upload video";
			throw new Error(errorMessage);
		}
	}

	async uploadVideos(
		projectId: string,
		files: File[],
		orders?: number[]
	): Promise<VideoFile[]> {
		try {
			const formData = new FormData();
			files.forEach((file) => {
				formData.append("videos", file);
			});
			if (orders) {
				formData.append("orders", JSON.stringify(orders));
			}

			const response = await apiClient.post<{
				success: boolean;
				data: VideoFile[];
				message?: string;
			}>(
				`${this.baseUrl}/${projectId}/videos/upload-multiple`,
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				}
			);

			return response.data.data;
		} catch (error) {
			const axiosError = error as AxiosError<{message?: string}>;
			const errorMessage =
				axiosError.response?.data?.message ||
				axiosError.message ||
				"Failed to upload videos";
			throw new Error(errorMessage);
		}
	}

	async getVideos(projectId: string): Promise<VideoFile[]> {
		try {
			const response = await apiClient.get<{
				success: boolean;
				data: VideoFile[];
				message?: string;
			}>(`${this.baseUrl}/${projectId}/videos`);

			return response.data.data || [];
		} catch (error) {
			const axiosError = error as AxiosError<{message?: string}>;
			const errorMessage =
				axiosError.response?.data?.message ||
				axiosError.message ||
				"Failed to fetch videos";
			throw new Error(errorMessage);
		}
	}

	async deleteVideo(projectId: string, filename: string): Promise<void> {
		try {
			await apiClient.delete<{
				success: boolean;
				message?: string;
			}>(`${this.baseUrl}/${projectId}/videos/${filename}`);
		} catch (error) {
			const axiosError = error as AxiosError<{message?: string}>;
			const errorMessage =
				axiosError.response?.data?.message ||
				axiosError.message ||
				"Failed to delete video";
			throw new Error(errorMessage);
		}
	}

	async updateVideoOrder(
		projectId: string,
		videos: {filename: string; order: number}[]
	): Promise<void> {
		try {
			await apiClient.put<{
				success: boolean;
				message?: string;
			}>(`${this.baseUrl}/${projectId}/videos/order`, {videos});
		} catch (error) {
			const axiosError = error as AxiosError<{message?: string}>;
			const errorMessage =
				axiosError.response?.data?.message ||
				axiosError.message ||
				"Failed to update video order";
			throw new Error(errorMessage);
		}
	}
	async getVideoToken(
		projectId: string,
		filename: string
	): Promise<string> {
		try {
			const response = await apiClient.get<{
				success: boolean;
				token: string;
			}>(`${this.baseUrl}/${projectId}/videos/${filename}/token`);

			return response.data.token;
		} catch (error) {
			const axiosError = error as AxiosError<{message?: string}>;
			const errorMessage =
				axiosError.response?.data?.message ||
				axiosError.message ||
				"Failed to get video token";
			throw new Error(errorMessage);
		}
	}
}

export default new ScriptGenerationService();
