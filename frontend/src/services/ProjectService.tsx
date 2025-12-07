import apiConfig from "@/configs/AppConfig";
import apiClient from "@/utils";
import type {AxiosError} from "axios";
import ScriptGenerationService, {
	type ScriptGenerationProject,
} from "./ScriptGenerationService";
import ScriptVoiceService, {
	type ScriptVoiceProject,
} from "./ScriptVoiceService";
import FullServiceService, {
	type FullServiceProject,
} from "./FullServiceService";

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

const transformToProject = (
	project: ScriptGenerationProject | ScriptVoiceProject | FullServiceProject,
	type: "script_generation" | "script_voice" | "full_service"
): Project => {
	return {
		id: project._id,
		projectId: project._id,
		title: project.title,
		description: project.description,
		thumbnail: project.thumbnail,
		type,
		status: project.status,
		createdAt: project.createdAt,
		updatedAt: project.updatedAt,
	};
};

class ProjectService {
	async getProjects(
		type?: "all" | "script_generation" | "script_voice" | "full_service"
	): Promise<Project[]> {
		try {
			const projectPromises: Promise<Project[]>[] = [];

			if (!type || type === "all" || type === "script_generation") {
				projectPromises.push(
					ScriptGenerationService.getProjects().then((projects) =>
						projects.map((p) =>
							transformToProject(p, "script_generation")
						)
					)
				);
			}

			if (!type || type === "all" || type === "script_voice") {
				projectPromises.push(
					ScriptVoiceService.getProjects().then((projects) =>
						projects.map((p) =>
							transformToProject(p, "script_voice")
						)
					)
				);
			}

			if (!type || type === "all" || type === "full_service") {
				projectPromises.push(
					FullServiceService.getProjects().then((projects) =>
						projects.map((p) =>
							transformToProject(p, "full_service")
						)
					)
				);
			}

			const results = await Promise.all(projectPromises);
			return results.flat().sort((a, b) => {
				return (
					new Date(b.createdAt).getTime() -
					new Date(a.createdAt).getTime()
				);
			});
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to fetch projects";
			throw new Error(errorMessage);
		}
	}

	async createProject(projectData: CreateProjectData): Promise<Project> {
		try {
			const response = await apiClient.post<{
				success: boolean;
				data: Project;
				message?: string;
			}>(`${apiConfig.apiBaseUrl}/projects`, projectData);

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

	async getProjectById(
		id: string,
		type: "script_generation" | "script_voice" | "full_service"
	): Promise<Project> {
		try {
			let project:
				| ScriptGenerationProject
				| ScriptVoiceProject
				| FullServiceProject;

			switch (type) {
				case "script_generation":
					project = await ScriptGenerationService.getProjectById(id);
					break;
				case "script_voice":
					project = await ScriptVoiceService.getProjectById(id);
					break;
				case "full_service":
					project = await FullServiceService.getProjectById(id);
					break;
				default:
					throw new Error("Invalid project type");
			}

			return transformToProject(project, type);
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to fetch project";
			throw new Error(errorMessage);
		}
	}

	async updateProject(
		id: string,
		type: "script_generation" | "script_voice" | "full_service",
		updateData: Partial<Project>
	): Promise<Project> {
		try {
			let project:
				| ScriptGenerationProject
				| ScriptVoiceProject
				| FullServiceProject;

			const {title, description, thumbnail, status} = updateData;
			const updatePayload: Partial<
				Pick<Project, "title" | "description" | "thumbnail" | "status">
			> = {
				...(title && {title}),
				...(description !== undefined && {description}),
				...(thumbnail !== undefined && {thumbnail}),
				...(status && {status}),
			};

			switch (type) {
				case "script_generation":
					project = await ScriptGenerationService.updateProject(
						id,
						updatePayload
					);
					break;
				case "script_voice":
					project = await ScriptVoiceService.updateProject(
						id,
						updatePayload
					);
					break;
				case "full_service":
					project = await FullServiceService.updateProject(
						id,
						updatePayload
					);
					break;
				default:
					throw new Error("Invalid project type");
			}

			return transformToProject(project, type);
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to update project";
			throw new Error(errorMessage);
		}
	}

	async deleteProject(
		id: string,
		type: "script_generation" | "script_voice" | "full_service"
	): Promise<void> {
		try {
			switch (type) {
				case "script_generation":
					await ScriptGenerationService.deleteProject(id);
					break;
				case "script_voice":
					await ScriptVoiceService.deleteProject(id);
					break;
				case "full_service":
					await FullServiceService.deleteProject(id);
					break;
				default:
					throw new Error("Invalid project type");
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to delete project";
			throw new Error(errorMessage);
		}
	}
}

export default new ProjectService();
