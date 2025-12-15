import {Response, NextFunction} from "express";
import User from "@/models/User";
import {AuthRequest} from "@/middlewares/auth";
import AppError from "@/utils/errors";
import {
	checkStorageAvailable,
	updateUserStorageUsed,
	formatStorageSize,
} from "@/utils/storageHelper";
import sseServer from "@/utils/sseServer";

export const getStorageInfo = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?._id;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		const actualUsed = await updateUserStorageUsed(userId);

		const user = await User.findById(userId).select(
			"storageLimit storageUsed credit"
		);

		if (!user) {
			throw new AppError("User not found", 404);
		}

		const storageLimit = user.storageLimit || 2147483648;
		const storageUsed = actualUsed;
		const available = storageLimit - storageUsed;

		const storageInfo = {
			limit: storageLimit,
			used: storageUsed,
			available: available,
			limitFormatted: formatStorageSize(storageLimit),
			usedFormatted: formatStorageSize(storageUsed),
			availableFormatted: formatStorageSize(available),
			credit: user.credit || 0,
		};

		sseServer.sendStorageEvent(userId.toString(), storageInfo);

		res.status(200).json({
			success: true,
			data: storageInfo,
		});
	} catch (error) {
		next(error);
	}
};

export const upgradeStorage = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?._id;
		const {amountGB} = req.body;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		if (!amountGB || typeof amountGB !== "number" || amountGB <= 0) {
			throw new AppError(
				"Invalid amountGB. Must be a positive number",
				400
			);
		}

		const requiredCredit = amountGB;
		const additionalBytes = amountGB * 1024 * 1024 * 1024;

		const user = await User.findById(userId).select("credit storageLimit");

		if (!user) {
			throw new AppError("User not found", 404);
		}

		const currentCredit = user.credit || 0;

		if (currentCredit < requiredCredit) {
			throw new AppError(
				`Insufficient credit. Required: ${requiredCredit}, Available: ${currentCredit}`,
				400
			);
		}

		const newCredit = currentCredit - requiredCredit;
		const currentLimit = user.storageLimit || 2147483648;
		const newLimit = currentLimit + additionalBytes;

		await User.findByIdAndUpdate(userId, {
			credit: newCredit,
			storageLimit: newLimit,
		});

		const actualUsed = await updateUserStorageUsed(userId);

		const available = newLimit - actualUsed;

		const storageInfo = {
			limit: newLimit,
			used: actualUsed,
			available: available,
			limitFormatted: formatStorageSize(newLimit),
			usedFormatted: formatStorageSize(actualUsed),
			availableFormatted: formatStorageSize(available),
			credit: newCredit,
		};

		sseServer.sendStorageEvent(userId.toString(), storageInfo);

		res.status(200).json({
			success: true,
			message: `Storage upgraded successfully. Added ${amountGB}GB`,
			data: storageInfo,
		});
	} catch (error) {
		next(error);
	}
};

export const getProjectsStorage = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?._id;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		const ScriptGenerationProject = (await import("@/models/ScriptGenerationProject")).default;
		const ScriptVoiceProject = (await import("@/models/ScriptVoiceProject")).default;
		const FullServiceProject = (await import("@/models/FullServiceProject")).default;

		const [scriptGenProjects, scriptVoiceProjects, fullServiceProjects] = await Promise.all([
			ScriptGenerationProject.find({userId}).select("_id title uploadedVideos createdAt").lean(),
			ScriptVoiceProject.find({userId}).select("_id title uploadedVideos createdAt").lean(),
			FullServiceProject.find({userId}).select("_id title uploadedVideos createdAt").lean(),
		]);

		const calculateProjectStorage = (project: {
			_id: string;
			title: string;
			uploadedVideos?: Array<{size: number}>;
			createdAt: Date;
		}, type: string) => {
			const storageUsed = project.uploadedVideos?.reduce((sum, video) => sum + (video.size || 0), 0) || 0;
			return {
				id: project._id.toString(),
				title: project.title,
				type,
				storageUsed,
				storageUsedFormatted: formatStorageSize(storageUsed),
				createdAt: project.createdAt,
			};
		};

		const allProjects = [
			...scriptGenProjects.map((p: unknown) => calculateProjectStorage(p as {_id: string; title: string; uploadedVideos?: Array<{size: number}>; createdAt: Date}, "script_generation")),
			...scriptVoiceProjects.map((p: unknown) => calculateProjectStorage(p as {_id: string; title: string; uploadedVideos?: Array<{size: number}>; createdAt: Date}, "script_voice")),
			...fullServiceProjects.map((p: unknown) => calculateProjectStorage(p as {_id: string; title: string; uploadedVideos?: Array<{size: number}>; createdAt: Date}, "full_service")),
		];

		allProjects.sort((a, b) => b.storageUsed - a.storageUsed);

		res.status(200).json({
			success: true,
			data: allProjects,
		});
	} catch (error) {
		next(error);
	}
};
