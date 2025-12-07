import {Response, NextFunction} from "express";
import mongoose from "mongoose";
import Project from "@/models/Project";
import User from "@/models/User";
import ScriptGenerationProject from "@/models/ScriptGenerationProject";
import ScriptVoiceProject from "@/models/ScriptVoiceProject";
import FullServiceProject from "@/models/FullServiceProject";
import {AuthRequest} from "@/middlewares/auth";
import AppError from "@/utils/errors";
import {createProjectNotification} from "@/helpers/notificationHelper";
import {
	createProjectFolder,
	deleteProjectFolder,
} from "@/utils/projectFileHelper";

export const getProjects = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?._id;
		const {type} = req.query;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		let userProject = await Project.findOneAndUpdate(
			{userId},
			{$setOnInsert: {userId, projects: []}},
			{new: true, upsert: true}
		);

		let filteredProjects = userProject.projects || [];
		if (type && type !== "all") {
			filteredProjects = filteredProjects.filter(
				(p: any) => p.type === type
			);
		}

		const transformedProjects = await Promise.all(
			filteredProjects.map(async (projectItem: any) => {
				let specificProject = null;

				if (projectItem.type === "script_generation") {
					specificProject = await ScriptGenerationProject.findById(
						projectItem.projectId
					);
				} else if (projectItem.type === "script_voice") {
					specificProject = await ScriptVoiceProject.findById(
						projectItem.projectId
					);
				} else if (projectItem.type === "full_service") {
					specificProject = await FullServiceProject.findById(
						projectItem.projectId
					);
				}

				if (!specificProject) {
					return null;
				}

				return {
					id: userProject._id.toString(),
					projectId: projectItem.projectId.toString(),
					title: specificProject.title,
					description: specificProject.description || "",
					thumbnail: specificProject.thumbnail,
					type: projectItem.type,
					status: specificProject.status,
					createdAt: specificProject.createdAt,
					updatedAt: specificProject.updatedAt,
				};
			})
		);

		const validProjects = transformedProjects
			.filter(Boolean)
			.sort(
				(a: any, b: any) =>
					new Date(b.updatedAt).getTime() -
					new Date(a.updatedAt).getTime()
			);

		res.status(200).json({
			success: true,
			data: validProjects,
		});
	} catch (error) {
		next(error);
	}
};

export const createProject = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const userId = req.user?._id;
	const {title, description, type} = req.body;
	let specificProjectId: mongoose.Types.ObjectId | undefined;
	let specificProject: any;

	try {
		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		if (
			!["script_generation", "script_voice", "full_service"].includes(
				type
			)
		) {
			throw new AppError("Invalid project type", 400);
		}

		const projectData = {
			title,
			description: description || "",
			userId,
			status: "pending" as const,
		};

		switch (type) {
			case "script_generation": {
				const scriptGenProject = new ScriptGenerationProject(
					projectData
				);
				await scriptGenProject.save();
				specificProjectId = scriptGenProject._id;
				specificProject = scriptGenProject;
				break;
			}
			case "script_voice": {
				const scriptVoiceProject = new ScriptVoiceProject(projectData);
				await scriptVoiceProject.save();
				specificProjectId = scriptVoiceProject._id;
				specificProject = scriptVoiceProject;
				break;
			}
			case "full_service": {
				const fullServiceProject = new FullServiceProject({
					...projectData,
					processingSteps: {
						scriptGeneration: "pending",
						voiceGeneration: "pending",
						videoGeneration: "pending",
					},
				});
				await fullServiceProject.save();
				specificProjectId = fullServiceProject._id;
				specificProject = fullServiceProject;
				break;
			}
			default:
				throw new AppError("Invalid project type", 400);
		}

		let userProject = await Project.findOneAndUpdate(
			{userId},
			{$setOnInsert: {userId, projects: []}},
			{new: true, upsert: true}
		);

		if (!userProject.projects || userProject.projects.length === 0) {
			await User.findByIdAndUpdate(userId, {
				project: userProject._id,
			});
		}

		userProject.projects.push({
			projectId: specificProjectId,
			type: type,
		});

		await userProject.save();

		// Tạo thư mục cho project
		try {
			await createProjectFolder(specificProjectId.toString());
		} catch (folderError) {
			console.error("Failed to create project folder:", folderError);
			// Không throw error vì project đã được tạo thành công
		}

		const transformedProject = {
			id: userProject._id.toString(),
			projectId: specificProjectId.toString(),
			title: specificProject.title,
			description: specificProject.description || "",
			thumbnail: specificProject.thumbnail,
			type: type,
			status: specificProject.status,
			createdAt: specificProject.createdAt,
			updatedAt: specificProject.updatedAt,
		};

		try {
			await createProjectNotification(
				userId.toString(),
				specificProject.title,
				"created",
				specificProjectId.toString(),
				type
			);
		} catch (notificationError) {
			console.error("Failed to create notification:", notificationError);
		}

		res.status(201).json({
			success: true,
			message: "Project created successfully",
			data: transformedProject,
		});
	} catch (error: any) {
		// Handle duplicate key error with retry logic
		if (
			(error.code === 11000 ||
				(error.name === "MongoServerError" &&
					error.keyPattern?.userId)) &&
			userId &&
			specificProjectId &&
			specificProject &&
			type
		) {
			try {
				const userProject = await Project.findOne({userId});
				if (userProject) {
					userProject.projects.push({
						projectId: specificProjectId,
						type: type,
					});
					await userProject.save();

					// Tạo thư mục cho project
					try {
						await createProjectFolder(specificProjectId.toString());
					} catch (folderError) {
						console.error(
							"Failed to create project folder:",
							folderError
						);
					}

					const transformedProject = {
						id: userProject._id.toString(),
						projectId: specificProjectId.toString(),
						title: specificProject.title,
						description: specificProject.description || "",
						thumbnail: specificProject.thumbnail,
						type: type,
						status: specificProject.status,
						createdAt: specificProject.createdAt,
						updatedAt: specificProject.updatedAt,
					};

					res.status(201).json({
						success: true,
						message: "Project created successfully",
						data: transformedProject,
					});
					return;
				}
			} catch (retryError) {}
		}

		next(error);
	}
};

export const getProjectById = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?._id;
		const {id} = req.params;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		const userProject = await Project.findOne({userId});

		if (!userProject) {
			throw new AppError("Project not found", 404);
		}

		const projectItem = userProject.projects.find(
			(p: any) => p.projectId.toString() === id
		);

		if (!projectItem) {
			throw new AppError("Project not found", 404);
		}

		let specificProject: any = null;

		if (projectItem.type === "script_generation") {
			specificProject = await ScriptGenerationProject.findById(
				projectItem.projectId
			);
		} else if (projectItem.type === "script_voice") {
			specificProject = await ScriptVoiceProject.findById(
				projectItem.projectId
			);
		} else if (projectItem.type === "full_service") {
			specificProject = await FullServiceProject.findById(
				projectItem.projectId
			);
		}

		if (!specificProject) {
			throw new AppError("Project details not found", 404);
		}

		const transformedProject = {
			id: userProject._id.toString(),
			projectId: projectItem.projectId.toString(),
			title: specificProject.title,
			description: specificProject.description || "",
			thumbnail: specificProject.thumbnail,
			type: projectItem.type,
			status: specificProject.status,
			createdAt: specificProject.createdAt,
			updatedAt: specificProject.updatedAt,
		};

		res.status(200).json({
			success: true,
			data: transformedProject,
		});
	} catch (error) {
		next(error);
	}
};

export const updateProject = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?._id;
		const {id} = req.params;
		const {title, description, thumbnail, status} = req.body;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		const userProject = await Project.findOne({userId});

		if (!userProject) {
			throw new AppError("Project not found", 404);
		}

		const projectItem = userProject.projects.find(
			(p: any) => p.projectId.toString() === id
		);

		if (!projectItem) {
			throw new AppError("Project not found", 404);
		}

		let specificProject: any = null;

		if (projectItem.type === "script_generation") {
			specificProject = await ScriptGenerationProject.findById(
				projectItem.projectId
			);
		} else if (projectItem.type === "script_voice") {
			specificProject = await ScriptVoiceProject.findById(
				projectItem.projectId
			);
		} else if (projectItem.type === "full_service") {
			specificProject = await FullServiceProject.findById(
				projectItem.projectId
			);
		}

		if (!specificProject) {
			throw new AppError("Project details not found", 404);
		}

		const updateData: any = {};

		if (title !== undefined) updateData.title = title;
		if (description !== undefined) updateData.description = description;
		if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
		if (status !== undefined) {
			if (
				!["pending", "processing", "completed", "failed"].includes(
					status
				)
			) {
				throw new AppError(
					"Status must be one of: pending, processing, completed, failed",
					400
				);
			}
			updateData.status = status;
		}

		if (Object.keys(updateData).length > 0) {
			await specificProject.updateOne({$set: updateData});
			await specificProject.save();
		}

		const updatedSpecificProject =
			projectItem.type === "script_generation"
				? await ScriptGenerationProject.findById(projectItem.projectId)
				: projectItem.type === "script_voice"
				? await ScriptVoiceProject.findById(projectItem.projectId)
				: await FullServiceProject.findById(projectItem.projectId);

		if (!updatedSpecificProject) {
			throw new AppError("Project details not found", 404);
		}

		const transformedProject = {
			id: userProject._id.toString(),
			projectId: projectItem.projectId.toString(),
			title: updatedSpecificProject.title,
			description: updatedSpecificProject.description || "",
			thumbnail: updatedSpecificProject.thumbnail,
			type: projectItem.type,
			status: updatedSpecificProject.status,
			createdAt: updatedSpecificProject.createdAt,
			updatedAt: updatedSpecificProject.updatedAt,
		};

		res.status(200).json({
			success: true,
			message: "Project updated successfully",
			data: transformedProject,
		});
	} catch (error) {
		next(error);
	}
};

export const deleteProject = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?._id;
		const {id} = req.params;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		const userProject = await Project.findOne({userId});

		if (!userProject) {
			throw new AppError("Project not found", 404);
		}

		const projectItem = userProject.projects.find(
			(p: any) => p.projectId.toString() === id
		);

		if (!projectItem) {
			throw new AppError("Project not found", 404);
		}

		try {
			await deleteProjectFolder(id);
		} catch (folderError) {
			console.error("Failed to delete project folder:", folderError);
		}

		if (projectItem.type === "script_generation") {
			await ScriptGenerationProject.findByIdAndDelete(
				projectItem.projectId
			);
		} else if (projectItem.type === "script_voice") {
			await ScriptVoiceProject.findByIdAndDelete(projectItem.projectId);
		} else if (projectItem.type === "full_service") {
			await FullServiceProject.findByIdAndDelete(projectItem.projectId);
		}

		userProject.projects = userProject.projects.filter(
			(p: any) => p.projectId.toString() !== id
		);

		await userProject.save();

		res.status(200).json({
			success: true,
			message: "Project deleted successfully",
		});
	} catch (error) {
		next(error);
	}
};
