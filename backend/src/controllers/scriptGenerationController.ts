import {Response, NextFunction} from "express";
import ScriptGenerationProject from "@/models/ScriptGenerationProject";
import Project from "@/models/Project";
import {AuthRequest} from "@/middlewares/auth";
import AppError from "@/utils/errors";

export const getScriptGenerationProjects = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?._id;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		const projects = await ScriptGenerationProject.find({userId})
			.sort({updatedAt: -1})
			.select("-__v");

		res.status(200).json({
			success: true,
			data: projects,
		});
	} catch (error) {
		next(error);
	}
};

export const createScriptGenerationProject = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?._id;
		const {
			title,
			description,
			videoUrl,
			videoDuration,
			generationSettings,
		} = req.body;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		const project = new ScriptGenerationProject({
			title,
			description,
			videoUrl,
			videoDuration,
			generationSettings,
			userId,
			status: "pending",
		});

		await project.save();

		res.status(201).json({
			success: true,
			message: "Project created successfully",
			data: project,
		});
	} catch (error) {
		next(error);
	}
};

export const getScriptGenerationProjectById = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?._id;
		const {id} = req.params; // This is the projectId (specific project ID)

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		// Find user's Project document
		const userProject = await Project.findOne({userId});

		if (!userProject) {
			throw new AppError("Project not found", 404);
		}

		// Find the project item in the array
		const projectItem = userProject.projects.find(
			(p: any) =>
				p.projectId.toString() === id && p.type === "script_generation"
		);

		if (!projectItem) {
			throw new AppError("Script generation project not found", 404);
		}

		// Find the ScriptGenerationProject by its ID
		const scriptGenerationProject = await ScriptGenerationProject.findOne({
			_id: projectItem.projectId,
			userId,
		}).select("-__v");

		if (!scriptGenerationProject) {
			throw new AppError(
				"Script generation project details not found",
				404
			);
		}

		res.status(200).json({
			success: true,
			data: scriptGenerationProject,
		});
	} catch (error) {
		next(error);
	}
};

export const updateScriptGenerationProject = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?._id;
		const {id} = req.params;
		const {
			title,
			description,
			thumbnail,
			status,
			scriptContent,
			scriptLanguage,
			videoUrl,
			videoDuration,
			generationSettings,
		} = req.body;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
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
		if (scriptContent !== undefined)
			updateData.scriptContent = scriptContent;
		if (scriptLanguage !== undefined)
			updateData.scriptLanguage = scriptLanguage;
		if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
		if (videoDuration !== undefined)
			updateData.videoDuration = videoDuration;
		if (generationSettings !== undefined)
			updateData.generationSettings = generationSettings;

		const project = await ScriptGenerationProject.findOneAndUpdate(
			{_id: id, userId},
			{$set: updateData},
			{new: true, runValidators: true}
		).select("-__v");

		if (!project) {
			throw new AppError("Project not found", 404);
		}

		res.status(200).json({
			success: true,
			message: "Project updated successfully",
			data: project,
		});
	} catch (error) {
		next(error);
	}
};

export const deleteScriptGenerationProject = async (
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

		const project = await ScriptGenerationProject.findOneAndDelete({
			_id: id,
			userId,
		});

		if (!project) {
			throw new AppError("Project not found", 404);
		}

		res.status(200).json({
			success: true,
			message: "Project deleted successfully",
		});
	} catch (error) {
		next(error);
	}
};
