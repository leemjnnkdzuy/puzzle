import fs from "fs/promises";
import path from "path";
import Project from "@/models/Project";
import {getProjectFolderPath} from "./projectFileHelper";

export const calculateUserStorageUsed = async (
	userId: any
): Promise<number> => {
	try {
		const userProject = await Project.findOne({userId});
		if (!userProject || !userProject.projects) {
			return 0;
		}

		let totalSize = 0;

		for (const projectItem of userProject.projects) {
			const projectFolderPath = getProjectFolderPath(
				projectItem.projectId.toString()
			);

			try {
				await fs.access(projectFolderPath);

				const files = await fs.readdir(projectFolderPath);

				for (const file of files) {
					const filePath = path.join(projectFolderPath, file);
					try {
						const stats = await fs.stat(filePath);
						if (stats.isFile()) {
							totalSize += stats.size;
						}
					} catch (error) {
						console.error(`Error reading file ${filePath}:`, error);
					}
				}
			} catch (error) {
				continue;
			}
		}

		return totalSize;
	} catch (error) {
		console.error("Error calculating user storage used:", error);
		throw error;
	}
};

export const checkStorageAvailable = async (
	userId: any,
	fileSize: number
): Promise<{
	available: boolean;
	availableSize: number;
	used: number;
	limit: number;
}> => {
	try {
		const User = (await import("@/models/User")).default;
		const user = await User.findById(userId).select(
			"storageLimit storageUsed"
		);

		if (!user) {
			throw new Error("User not found");
		}

		const storageLimit = user.storageLimit || 2147483648;
		const storageUsed = user.storageUsed || 0;
		const availableSize = storageLimit - storageUsed;

		return {
			available: availableSize >= fileSize,
			availableSize,
			used: storageUsed,
			limit: storageLimit,
		};
	} catch (error) {
		console.error("Error checking storage available:", error);
		throw error;
	}
};

export const formatStorageSize = (bytes: number): string => {
	if (bytes === 0) return "0 B";

	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const updateUserStorageUsed = async (userId: any): Promise<number> => {
	try {
		const totalUsed = await calculateUserStorageUsed(userId);
		const User = (await import("@/models/User")).default;

		await User.findByIdAndUpdate(userId, {
			storageUsed: totalUsed,
		});

		return totalUsed;
	} catch (error) {
		console.error("Error updating user storage used:", error);
		throw error;
	}
};
