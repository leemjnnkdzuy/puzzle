import {Response, NextFunction} from "express";
import ScriptGenerationProject, {
	type IScriptGenerationProject,
	type IVideoFile,
} from "@/models/ScriptGenerationProject";
import Project from "@/models/Project";
import {AuthRequest} from "@/middlewares/auth";
import AppError from "@/utils/errors";
import {
	getProjectFolderPath,
	projectFolderExists,
	deleteProjectFolder,
} from "@/utils/projectFileHelper";
import {
	checkStorageAvailable,
	updateUserStorageUsed,
	formatStorageSize,
} from "@/utils/storageHelper";
import {isOriginAllowed, getAllowedOriginsList} from "@/configs/corsConfig";
import sseServer from "@/utils/sseServer";
import User from "@/models/User";
import fs from "fs/promises";
import {createReadStream, statSync} from "fs";
import path from "path";
import {getVideoMetadata} from "@/helpers/videoHelper";
import {DRMHelper} from "@/utils/drmHelper";

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
				p.projectId.toString() === id && p.type === "script_generation"
		);

		if (!projectItem) {
			throw new AppError("Script generation project not found", 404);
		}

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

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		const userProject = await Project.findOne({userId});

		if (!userProject) {
			throw new AppError("Project not found", 404);
		}

		const projectItem = userProject.projects.find(
			(p: any) =>
				p.projectId.toString() === id && p.type === "script_generation"
		);

		if (!projectItem) {
			throw new AppError("Script generation project not found", 404);
		}

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
			{_id: projectItem.projectId, userId},
			{$set: updateData},
			{new: true, runValidators: true}
		).select("-__v");

		if (!project) {
			throw new AppError(
				"Script generation project details not found",
				404
			);
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

		const userProject = await Project.findOne({userId});

		if (!userProject) {
			throw new AppError("Project not found", 404);
		}

		const projectItem = userProject.projects.find(
			(p: any) =>
				p.projectId.toString() === id && p.type === "script_generation"
		);

		if (!projectItem) {
			throw new AppError("Script generation project not found", 404);
		}

		const project = await ScriptGenerationProject.findOneAndDelete({
			_id: projectItem.projectId,
			userId,
		});

		if (!project) {
			throw new AppError(
				"Script generation project details not found",
				404
			);
		}

		userProject.projects = userProject.projects.filter(
			(p: any) => p.projectId.toString() !== id
		);
		await userProject.save();

		try {
			await deleteProjectFolder(projectItem.projectId.toString());
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

const verifyScriptGenerationProjectOwnership = async (
	userId: any,
	projectId: string
): Promise<IScriptGenerationProject | null> => {
	const userProject = await Project.findOne({userId});

	if (!userProject) {
		return null;
	}

	const projectItem = userProject.projects.find(
		(p: any) =>
			p.projectId.toString() === projectId &&
			p.type === "script_generation"
	);

	if (!projectItem) {
		return null;
	}

	const scriptGenerationProject = await ScriptGenerationProject.findOne({
		_id: projectItem.projectId,
		userId,
	});

	return scriptGenerationProject;
};

export const uploadScriptGenerationVideo = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?._id;
		const {id: projectId} = req.params;
		const {order} = req.body;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		const project = await verifyScriptGenerationProjectOwnership(
			userId,
			projectId
		);

		if (!project) {
			throw new AppError("Project not found or access denied", 404);
		}

		if (!req.file) {
			throw new AppError("No video file uploaded", 400);
		}

		const storageCheck = await checkStorageAvailable(userId, req.file.size);
		if (!storageCheck.available) {
			const projectFolderPath = getProjectFolderPath(projectId);
			const filePath = path.join(projectFolderPath, req.file.filename);
			try {
				await fs.unlink(filePath);
			} catch (deleteError) {
				console.error("Error deleting file after storage check failed:", deleteError);
			}

			const availableFormatted = formatStorageSize(
				storageCheck.availableSize
			);
			const requiredFormatted = formatStorageSize(req.file.size);
			throw new AppError(
				`Không đủ dung lượng! Dung lượng còn lại: ${availableFormatted}, Cần: ${requiredFormatted}. Vui lòng nâng cấp storage.`,
				400
			);
		}

		const projectFolderPath = getProjectFolderPath(projectId);
		const filePath = path.join(projectFolderPath, req.file.filename);

		let metadata = {};
		try {
			metadata = await getVideoMetadata(filePath);
		} catch (err) {
			console.error("Failed to extract video metadata:", err);
		}

		const videoInfo = {
			filename: req.file.filename,
			originalName: req.file.originalname,
			size: req.file.size,
			mimetype: req.file.mimetype,
			order: order
				? parseInt(order)
				: (project.uploadedVideos?.length || 0) + 1,
			uploadedAt: new Date(),
			...metadata,
		};

		if (!project.uploadedVideos) {
			project.uploadedVideos = [];
		}

		project.uploadedVideos.push(videoInfo);
		await project.save();

		const actualUsed = await updateUserStorageUsed(userId);

		const user = await User.findById(userId).select(
			"storageLimit storageUsed credit"
		);
		if (user) {
			const storageLimit = user.storageLimit || 2147483648;
			const available = storageLimit - actualUsed;
			sseServer.sendStorageEvent(userId.toString(), {
				limit: storageLimit,
				used: actualUsed,
				available: available,
				limitFormatted: formatStorageSize(storageLimit),
				usedFormatted: formatStorageSize(actualUsed),
				availableFormatted: formatStorageSize(available),
				credit: user.credit || 0,
			});
		}

		res.status(201).json({
			success: true,
			message: "Video uploaded successfully",
			data: videoInfo,
		});
	} catch (error) {
		next(error);
	}
};

export const uploadScriptGenerationVideos = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?._id;
		const {id: projectId} = req.params;
		const {orders} = req.body;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		const project = await verifyScriptGenerationProjectOwnership(
			userId,
			projectId
		);

		if (!project) {
			throw new AppError("Project not found or access denied", 404);
		}

		if (!req.files) {
			throw new AppError("No video files uploaded", 400);
		}

		const files = Array.isArray(req.files) ? req.files : [];

		if (files.length === 0) {
			throw new AppError("No video files uploaded", 400);
		}

		const totalSize = (files as Express.Multer.File[]).reduce(
			(sum, file) => sum + file.size,
			0
		);

		const storageCheck = await checkStorageAvailable(userId, totalSize);
		if (!storageCheck.available) {
			// Xóa tất cả các file đã upload vì không đủ dung lượng
			const projectFolderPath = getProjectFolderPath(projectId);
			for (const file of files as Express.Multer.File[]) {
				const filePath = path.join(projectFolderPath, file.filename);
				try {
					await fs.unlink(filePath);
				} catch (deleteError) {
					console.error("Error deleting file after storage check failed:", deleteError);
				}
			}

			const availableFormatted = formatStorageSize(
				storageCheck.availableSize
			);
			const requiredFormatted = formatStorageSize(totalSize);
			throw new AppError(
				`Không đủ dung lượng! Dung lượng còn lại: ${availableFormatted}, Cần: ${requiredFormatted}. Vui lòng nâng cấp storage.`,
				400
			);
		}

		const orderArray = orders ? JSON.parse(orders) : null;

		if (!project.uploadedVideos) {
			project.uploadedVideos = [];
		}

		const baseOrder = project.uploadedVideos.length;
		const uploadedVideos: IVideoFile[] = [];

		const projectFolderPath = getProjectFolderPath(projectId);

		for (let i = 0; i < (files as Express.Multer.File[]).length; i++) {
			const file = (files as Express.Multer.File[])[i];
			const index = i;

			const order =
				orderArray && orderArray[index]
					? parseInt(orderArray[index])
					: baseOrder + index + 1;

			const filePath = path.join(projectFolderPath, file.filename);
			let metadata = {};
			try {
				metadata = await getVideoMetadata(filePath);
			} catch (err) {
				console.error("Failed to extract video metadata:", err);
			}

			const videoInfo: IVideoFile = {
				filename: file.filename,
				originalName: file.originalname,
				size: file.size,
				mimetype: file.mimetype,
				order: order,
				uploadedAt: new Date(),
				...metadata,
			};

			project.uploadedVideos!.push(videoInfo);
			uploadedVideos.push(videoInfo);
		}

		await project.save();

		const actualUsed = await updateUserStorageUsed(userId);

		const user = await User.findById(userId).select(
			"storageLimit storageUsed credit"
		);
		if (user) {
			const storageLimit = user.storageLimit || 2147483648;
			const available = storageLimit - actualUsed;
			sseServer.sendStorageEvent(userId.toString(), {
				limit: storageLimit,
				used: actualUsed,
				available: available,
				limitFormatted: formatStorageSize(storageLimit),
				usedFormatted: formatStorageSize(actualUsed),
				availableFormatted: formatStorageSize(available),
				credit: user.credit || 0,
			});
		}

		res.status(201).json({
			success: true,
			message: `${uploadedVideos.length} video(s) uploaded successfully`,
			data: uploadedVideos,
		});
	} catch (error) {
		next(error);
	}
};

export const getScriptGenerationVideos = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?._id;
		const {id: projectId} = req.params;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		const project = await verifyScriptGenerationProjectOwnership(
			userId,
			projectId
		);

		if (!project) {
			throw new AppError("Project not found or access denied", 404);
		}

		const videos = project.uploadedVideos || [];

		const sortedVideos = [...videos].sort((a, b) => a.order - b.order);

		res.status(200).json({
			success: true,
			data: sortedVideos,
		});
	} catch (error) {
		next(error);
	}
};

export const getScriptGenerationVideo = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?._id;
		const {id: projectId, filename} = req.params;
		const referer = req.headers.referer;


		if (!referer) {
			throw new AppError("Direct access not allowed", 403);
		}

		const origin = req.headers.origin;
		const allowedOrigin = origin || (referer ? new URL(referer).origin : "");

		const allowedOrigins = getAllowedOriginsList();
		const isDev = process.env.NODE_ENV === "development";
		
		const isAllowed = 
			isDev || 
			isOriginAllowed(allowedOrigin) || 
			allowedOrigins.includes(allowedOrigin) || 
			allowedOrigin.includes("localhost:5000") ||
			allowedOrigin.includes("127.0.0.1:5000");

		if (!isAllowed) {
			throw new AppError("Access denied from this origin", 403);
		}

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		const drmToken = req.query.drm_token as string;
		if (!drmToken) {
			throw new AppError("Access denied: Missing DRM token", 403);
		}
		
		try {
			DRMHelper.verifyToken(drmToken, filename, userId.toString());
		} catch (err) {
			throw new AppError("Access denied: Invalid or expired DRM token", 403);
		}

		const project = await verifyScriptGenerationProjectOwnership(
			userId,
			projectId
		);

		if (!project) {
			throw new AppError("Project not found or access denied", 404);
		}

		const video = project.uploadedVideos?.find(
			(v: IVideoFile) => v.filename === filename
		);

		if (!video) {
			throw new AppError("Video not found", 404);
		}

		const projectFolderPath = getProjectFolderPath(projectId);
		const filePath = path.join(projectFolderPath, filename);

		try {
			await fs.access(filePath);
		} catch {
			throw new AppError("Video file not found", 404);
		}

		const stat = statSync(filePath);
		const fileSize = stat.size;
		const range = req.headers.range;
		const contentType = video.mimetype || "video/mp4";

		if (range) {
			const rangeMatch = range.match(/bytes=(\d+)-(\d*)/);
			if (!rangeMatch) {
				const origin = req.headers.origin;
				const allowedOrigin =
					origin && isOriginAllowed(origin) ? origin : undefined;
				const head: Record<string, string> = {
					"Content-Length": fileSize.toString(),
					"Content-Type": contentType,
					"Accept-Ranges": "bytes",
					"Cache-Control": "public, max-age=31536000",
				};
				if (allowedOrigin) {
					head["Access-Control-Allow-Origin"] = allowedOrigin;
					head["Access-Control-Allow-Credentials"] = "true";
					head["Access-Control-Expose-Headers"] =
						"Content-Range, Accept-Ranges, Content-Length";
				}
				res.writeHead(200, head);
				const file = createReadStream(filePath, {
					highWaterMark: 1024 * 1024,
				});
				file.pipe(res);
				return;
			}

			const start = parseInt(rangeMatch[1], 10);
			const end = rangeMatch[2]
				? parseInt(rangeMatch[2], 10)
				: fileSize - 1;
			const chunksize = end - start + 1;

			if (
				isNaN(start) ||
				isNaN(end) ||
				start >= fileSize ||
				end >= fileSize ||
				start > end ||
				start < 0
			) {
				const origin = req.headers.origin;
				const allowedOrigin =
					origin && isOriginAllowed(origin) ? origin : undefined;
				const head: Record<string, string> = {
					"Content-Range": `bytes */${fileSize}`,
					"Accept-Ranges": "bytes",
				};
				if (allowedOrigin) {
					head["Access-Control-Allow-Origin"] = allowedOrigin;
					head["Access-Control-Allow-Credentials"] = "true";
				}
				res.writeHead(416, head);
				res.end();
				return;
			}

			const file = createReadStream(filePath, {
				start,
				end,
				highWaterMark: 1024 * 1024,
			});
			const origin = req.headers.origin;
			const allowedOrigin =
				origin && isOriginAllowed(origin) ? origin : undefined;
			const head: Record<string, string> = {
				"Content-Range": `bytes ${start}-${end}/${fileSize}`,
				"Accept-Ranges": "bytes",
				"Content-Length": chunksize.toString(),
				"Content-Type": contentType,
				"Cache-Control": "public, max-age=31536000",
			};
			if (allowedOrigin) {
				head["Access-Control-Allow-Origin"] = allowedOrigin;
				head["Access-Control-Allow-Credentials"] = "true";
				head["Access-Control-Expose-Headers"] =
					"Content-Range, Accept-Ranges, Content-Length";
			}
			res.writeHead(206, head);

			req.setTimeout(10 * 60 * 1000);
			res.setTimeout(10 * 60 * 1000);

			file.on("error", (err) => {
				if (!res.headersSent) {
					res.status(500).end();
				}
			});

			file.pipe(res);
		} else {
			const origin = req.headers.origin;
			const allowedOrigin =
				origin && isOriginAllowed(origin) ? origin : undefined;
			const head: Record<string, string> = {
				"Content-Length": fileSize.toString(),
				"Content-Type": contentType,
				"Accept-Ranges": "bytes",
				"Cache-Control": "public, max-age=31536000",
			};
			if (allowedOrigin) {
				head["Access-Control-Allow-Origin"] = allowedOrigin;
				head["Access-Control-Allow-Credentials"] = "true";
				head["Access-Control-Expose-Headers"] =
					"Content-Range, Accept-Ranges, Content-Length";
			}
			res.writeHead(200, head);

			req.setTimeout(10 * 60 * 1000);
			res.setTimeout(10 * 60 * 1000);

			const file = createReadStream(filePath, {
				highWaterMark: 1024 * 1024,
			});

			file.on("error", (err) => {
				if (!res.headersSent) {
					res.status(500).end();
				}
			});

			file.pipe(res);
		}
	} catch (error) {
		next(error);
	}
};

export const deleteScriptGenerationVideo = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?._id;
		const {id: projectId, filename} = req.params;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		const project = await verifyScriptGenerationProjectOwnership(
			userId,
			projectId
		);

		if (!project) {
			throw new AppError("Project not found or access denied", 404);
		}

		const videoIndex = project.uploadedVideos?.findIndex(
			(v: IVideoFile) => v.filename === filename
		);

		if (videoIndex === undefined || videoIndex === -1) {
			throw new AppError("Video not found", 404);
		}

		const projectFolderPath = getProjectFolderPath(projectId);
		const filePath = path.join(projectFolderPath, filename);

		try {
			await fs.access(filePath);
			await fs.unlink(filePath);
		} catch (fileError) {
			console.error("Error deleting file:", fileError);
		}

		project.uploadedVideos?.splice(videoIndex, 1);
		await project.save();

		const actualUsed = await updateUserStorageUsed(userId);

		const user = await User.findById(userId).select(
			"storageLimit storageUsed credit"
		);
		if (user) {
			const storageLimit = user.storageLimit || 2147483648;
			const available = storageLimit - actualUsed;
			sseServer.sendStorageEvent(userId.toString(), {
				limit: storageLimit,
				used: actualUsed,
				available: available,
				limitFormatted: formatStorageSize(storageLimit),
				usedFormatted: formatStorageSize(actualUsed),
				availableFormatted: formatStorageSize(available),
				credit: user.credit || 0,
			});
		}

		res.status(200).json({
			success: true,
			message: "Video deleted successfully",
		});
	} catch (error) {
		next(error);
	}
};

export const getScriptGenerationVideoToken = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?._id;
		const {id: projectId, filename} = req.params;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		// Verify project exists and user has access
		const project = await verifyScriptGenerationProjectOwnership(
			userId,
			projectId
		);

		if (!project) {
			throw new AppError("Project not found or access denied", 404);
		}

		// Verify video exists in project
		const videoExists = project.uploadedVideos?.some(
			(v: IVideoFile) => v.filename === filename
		);

		if (!videoExists) {
			throw new AppError("Video not found", 404);
		}
		
		// Generate Token
		const token = DRMHelper.generateToken(filename, userId.toString());

		res.status(200).json({
			success: true,
			token,
		});
	} catch (error) {
		next(error);
	}
};

export const updateScriptGenerationVideoOrder = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?._id;
		const {id: projectId} = req.params;
		const {videos} = req.body;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		const project = await verifyScriptGenerationProjectOwnership(
			userId,
			projectId
		);

		if (!project) {
			throw new AppError("Project not found or access denied", 404);
		}

		if (!Array.isArray(videos)) {
			throw new AppError("Videos must be an array", 400);
		}

		if (project.uploadedVideos) {
			videos.forEach(
				({filename, order}: {filename: string; order: number}) => {
					const video = project.uploadedVideos?.find(
						(v: IVideoFile) => v.filename === filename
					);
					if (video) {
						video.order = order;
					}
				}
			);

			await project.save();
		}

		res.status(200).json({
			success: true,
			message: "Video order updated successfully",
		});
	} catch (error) {
		next(error);
	}
};
