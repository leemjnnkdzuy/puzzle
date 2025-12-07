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

/**
 * Lấy thông tin storage của user
 */
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

		// Cập nhật storageUsed từ files thực tế
		const actualUsed = await updateUserStorageUsed(userId);

		const user = await User.findById(userId).select(
			"storageLimit storageUsed credit"
		);

		if (!user) {
			throw new AppError("User not found", 404);
		}

		const storageLimit = user.storageLimit || 2147483648; // Default 2GB
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

		// Gửi SSE event
		sseServer.sendStorageEvent(userId.toString(), storageInfo);

		res.status(200).json({
			success: true,
			data: storageInfo,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Nâng cấp storage bằng credit
 */
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

		// 1GB = 1 credit
		const requiredCredit = amountGB;
		const additionalBytes = amountGB * 1024 * 1024 * 1024; // Convert GB to bytes

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

		// Trừ credit và tăng storageLimit
		const newCredit = currentCredit - requiredCredit;
		const currentLimit = user.storageLimit || 2147483648; // Default 2GB
		const newLimit = currentLimit + additionalBytes;

		await User.findByIdAndUpdate(userId, {
			credit: newCredit,
			storageLimit: newLimit,
		});

		// Cập nhật storageUsed
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

		// Gửi SSE event
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

/**
 * Lấy danh sách project với storage usage
 */
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

		// Import models dynamically to avoid circular dependencies
		const ScriptGenerationProject = (await import("@/models/ScriptGenerationProject")).default;
		const ScriptVoiceProject = (await import("@/models/ScriptVoiceProject")).default;
		const FullServiceProject = (await import("@/models/FullServiceProject")).default;

		// Get all projects from all types
		const [scriptGenProjects, scriptVoiceProjects, fullServiceProjects] = await Promise.all([
			ScriptGenerationProject.find({userId}).select("_id title uploadedVideos createdAt").lean(),
			ScriptVoiceProject.find({userId}).select("_id title uploadedVideos createdAt").lean(),
			FullServiceProject.find({userId}).select("_id title uploadedVideos createdAt").lean(),
		]);

		// Calculate storage for each project
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

		// Sort by storage used (descending)
		allProjects.sort((a, b) => b.storageUsed - a.storageUsed);

		res.status(200).json({
			success: true,
			data: allProjects,
		});
	} catch (error) {
		next(error);
	}
};
