import {Response, NextFunction} from "express";
import FullServiceProject from "@/models/FullServiceProject";
import Project from "@/models/Project";
import {AuthRequest} from "@/middlewares/auth";
import AppError from "@/utils/errors";

export const getFullServiceProjects = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?._id;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		const projects = await FullServiceProject.find({userId})
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

export const createFullServiceProject = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?._id;
		const {
			title,
			description,
			generationSettings,
			voiceSettings,
			language,
		} = req.body;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		const project = new FullServiceProject({
			title,
			description,
			generationSettings,
			voiceSettings,
			language,
			userId,
			status: "pending",
			processingSteps: {
				scriptGeneration: "pending",
				voiceGeneration: "pending",
				videoGeneration: "pending",
			},
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

export const getFullServiceProjectById = async (
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
			(p: any) =>
				p.projectId.toString() === id && p.type === "full_service"
		);

		if (!projectItem) {
			throw new AppError("Full service project not found", 404);
		}

		const fullServiceProject = await FullServiceProject.findOne({
			_id: projectItem.projectId,
			userId,
		}).select("-__v");

		if (!fullServiceProject) {
			throw new AppError("Full service project details not found", 404);
		}

		res.status(200).json({
			success: true,
			data: fullServiceProject,
		});
	} catch (error) {
		next(error);
	}
};

export const updateFullServiceProject = async (
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
			videoUrl,
			audioUrl,
			videoDuration,
			audioDuration,
			generationSettings,
			voiceSettings,
			language,
			processingSteps,
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
		if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
		if (audioUrl !== undefined) updateData.audioUrl = audioUrl;
		if (videoDuration !== undefined)
			updateData.videoDuration = videoDuration;
		if (audioDuration !== undefined)
			updateData.audioDuration = audioDuration;
		if (generationSettings !== undefined)
			updateData.generationSettings = generationSettings;
		if (voiceSettings !== undefined)
			updateData.voiceSettings = voiceSettings;
		if (language !== undefined) updateData.language = language;
		if (processingSteps !== undefined)
			updateData.processingSteps = processingSteps;

		const project = await FullServiceProject.findOneAndUpdate(
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

export const deleteFullServiceProject = async (
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

		const project = await FullServiceProject.findOneAndDelete({
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
