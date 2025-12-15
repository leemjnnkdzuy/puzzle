import {Response, NextFunction} from "express";
import ScriptVoiceProject from "@/models/ScriptVoiceProject";
import Project from "@/models/Project";
import {AuthRequest} from "@/middlewares/auth";
import AppError from "@/utils/errors";
import {deleteProjectFolder} from "@/utils/projectFileHelper";

export const getScriptVoiceProjects = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?._id;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		const projects = await ScriptVoiceProject.find({userId})
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

export const createScriptVoiceProject = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?._id;
		const {title, description, scriptContent, voiceSettings, language} =
			req.body;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		const project = new ScriptVoiceProject({
			title,
			description,
			scriptContent,
			voiceSettings,
			language,
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

export const getScriptVoiceProjectById = async (
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
				p.projectId.toString() === id && p.type === "script_voice"
		);

		if (!projectItem) {
			throw new AppError("Script voice project not found", 404);
		}

		const scriptVoiceProject = await ScriptVoiceProject.findOne({
			_id: projectItem.projectId,
			userId,
		}).select("-__v");

		if (!scriptVoiceProject) {
			throw new AppError("Script voice project details not found", 404);
		}

		res.status(200).json({
			success: true,
			data: scriptVoiceProject,
		});
	} catch (error) {
		next(error);
	}
};

export const updateScriptVoiceProject = async (
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
			voiceSettings,
			audioUrl,
			audioDuration,
			language,
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
		if (voiceSettings !== undefined)
			updateData.voiceSettings = voiceSettings;
		if (audioUrl !== undefined) updateData.audioUrl = audioUrl;
		if (audioDuration !== undefined)
			updateData.audioDuration = audioDuration;
		if (language !== undefined) updateData.language = language;

		const project = await ScriptVoiceProject.findOneAndUpdate(
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

export const deleteScriptVoiceProject = async (
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

		const project = await ScriptVoiceProject.findOneAndDelete({
			_id: id,
			userId,
		});

		if (!project) {
			throw new AppError("Project not found", 404);
		}

		try {
			await deleteProjectFolder(id);
		} catch (folderError) {
			console.error("Failed to delete project folder:", folderError);
		}

		res.status(200).json({
			success: true,
			message: "Project deleted successfully",
		});
	} catch (error) {
		next(error);
	}
};
