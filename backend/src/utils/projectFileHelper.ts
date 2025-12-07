import fs from "fs/promises";
import path from "path";

const UPLOADS_DIR = path.join(__dirname, "../../uploads");
const PROJECT_DIR = path.join(UPLOADS_DIR, "project");

export const createProjectFolder = async (
	projectId: string
): Promise<string> => {
	try {
		const projectFolderPath = getProjectFolderPath(projectId);

		await fs.mkdir(UPLOADS_DIR, {recursive: true});

		await fs.mkdir(PROJECT_DIR, {recursive: true});

		await fs.mkdir(projectFolderPath, {recursive: true});

		return projectFolderPath;
	} catch (error) {
		console.error(`Error creating project folder for ${projectId}:`, error);
		throw error;
	}
};

export const deleteProjectFolder = async (projectId: string): Promise<void> => {
	try {
		const projectFolderPath = getProjectFolderPath(projectId);

		try {
			await fs.access(projectFolderPath);
		} catch {
			return;
		}

		await fs.rm(projectFolderPath, {recursive: true, force: true});
	} catch (error) {
		console.error(`Error deleting project folder for ${projectId}:`, error);
		throw error;
	}
};

export const getProjectFolderPath = (projectId: string): string => {
	return path.join(PROJECT_DIR, projectId);
};

export const projectFolderExists = async (
	projectId: string
): Promise<boolean> => {
	try {
		const projectFolderPath = getProjectFolderPath(projectId);
		await fs.access(projectFolderPath);
		return true;
	} catch {
		return false;
	}
};
