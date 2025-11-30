import apiConfig from "@/configs/AppConfig";
import apiClient from "@/utils/axiosInstance";
import type {AxiosError} from "axios";

export interface Project {
	id: string;
	projectId: string;
	title: string;
	description: string;
	thumbnail?: string;
	type: "script_generation" | "script_voice" | "full_service";
	status: "pending" | "processing" | "completed" | "failed";
	createdAt: string;
	updatedAt: string;
}

export interface CreateProjectData {
	title: string;
	description: string;
	type: "script_generation" | "script_voice" | "full_service";
}

class ProjectService {
	private baseUrl = `${apiConfig.apiBaseUrl}/projects`;

	async getProjects(
		type?: "all" | "script_generation" | "script_voice" | "full_service"
	): Promise<Project[]> {
		try {
			const url =
				type && type !== "all"
					? `${this.baseUrl}?type=${type}`
					: this.baseUrl;

			const response = await apiClient.get<{
				success: boolean;
				data: Project[];
				message?: string;
			}>(url);

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

	async createProject(projectData: CreateProjectData): Promise<Project> {
		try {
			const response = await apiClient.post<{
				success: boolean;
				data: Project;
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

	async getProjectById(id: string): Promise<Project> {
		try {
			const response = await apiClient.get<{
				success: boolean;
				data: Project;
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
		updateData: Partial<Project>
	): Promise<Project> {
		try {
			const response = await apiClient.put<{
				success: boolean;
				data: Project;
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

export default new ProjectService();
