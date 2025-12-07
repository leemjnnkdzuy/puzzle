import {Response, NextFunction} from "express";
import fs from "fs/promises";
import path from "path";
import {createReadStream, statSync} from "fs";
import {AuthRequest} from "@/middlewares/auth";
import AppError from "@/utils/errors";
import Project from "@/models/Project";
import {
	getProjectFolderPath,
	projectFolderExists,
} from "@/utils/projectFileHelper";

/**
 * Helper function để kiểm tra quyền sở hữu project
 */
const verifyProjectOwnership = async (
	userId: any,
	projectId: string
): Promise<boolean> => {
	const userProject = await Project.findOne({userId});

	if (!userProject) {
		return false;
	}

	const projectItem = userProject.projects.find(
		(p: any) => p.projectId.toString() === projectId
	);

	return !!projectItem;
};

/**
 * Upload video vào project folder
 */
export const uploadVideo = async (
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

		// Kiểm tra quyền sở hữu
		const isOwner = await verifyProjectOwnership(userId, projectId);
		if (!isOwner) {
			throw new AppError("Project not found or access denied", 404);
		}

		// Kiểm tra file đã được upload chưa
		if (!req.file) {
			throw new AppError("No video file uploaded", 400);
		}

		const fileInfo = {
			filename: req.file.filename,
			originalName: req.file.originalname,
			size: req.file.size,
			mimetype: req.file.mimetype,
			path: req.file.path,
		};

		res.status(201).json({
			success: true,
			message: "Video uploaded successfully",
			data: fileInfo,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Stream video (chỉ chủ sở hữu mới xem được)
 */
export const getVideo = async (
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

		// Kiểm tra quyền sở hữu
		const isOwner = await verifyProjectOwnership(userId, projectId);
		if (!isOwner) {
			throw new AppError("Project not found or access denied", 404);
		}

		// Sanitize filename để tránh path traversal
		const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "");

		const projectFolderPath = getProjectFolderPath(projectId);
		const filePath = path.join(projectFolderPath, sanitizedFilename);

		// Kiểm tra file có tồn tại không
		try {
			await fs.access(filePath);
		} catch {
			throw new AppError("Video file not found", 404);
		}

		// Kiểm tra file có phải video không
		const stats = statSync(filePath);
		if (!stats.isFile()) {
			throw new AppError("Invalid file", 400);
		}

		// Lấy file size
		const fileSize = stats.size;
		const range = req.headers.range;

		if (range) {
			// Hỗ trợ range requests cho video streaming
			const parts = range.replace(/bytes=/, "").split("-");
			const start = parseInt(parts[0], 10);
			const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
			const chunksize = end - start + 1;
			const file = createReadStream(filePath, {start, end});
			const head = {
				"Content-Range": `bytes ${start}-${end}/${fileSize}`,
				"Accept-Ranges": "bytes",
				"Content-Length": chunksize,
				"Content-Type": "video/mp4",
			};

			res.writeHead(206, head);
			file.pipe(res);
		} else {
			// Stream toàn bộ file
			const head = {
				"Content-Length": fileSize,
				"Content-Type": "video/mp4",
			};

			res.writeHead(200, head);
			createReadStream(filePath).pipe(res);
		}
	} catch (error) {
		next(error);
	}
};

/**
 * Liệt kê danh sách video trong project
 */
export const listVideos = async (
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

		// Kiểm tra quyền sở hữu
		const isOwner = await verifyProjectOwnership(userId, projectId);
		if (!isOwner) {
			throw new AppError("Project not found or access denied", 404);
		}

		const projectFolderPath = getProjectFolderPath(projectId);

		// Kiểm tra thư mục có tồn tại không
		const exists = await projectFolderExists(projectId);
		if (!exists) {
			res.status(200).json({
				success: true,
				data: [],
			});
			return;
		}

		// Đọc danh sách file trong thư mục
		const files = await fs.readdir(projectFolderPath);
		const videoFiles = [];

		for (const file of files) {
			const filePath = path.join(projectFolderPath, file);
			const stats = await fs.stat(filePath);

			if (stats.isFile()) {
				videoFiles.push({
					filename: file,
					size: stats.size,
					createdAt: stats.birthtime,
					modifiedAt: stats.mtime,
				});
			}
		}

		res.status(200).json({
			success: true,
			data: videoFiles,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Xóa video khỏi project
 */
export const deleteVideo = async (
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

		// Kiểm tra quyền sở hữu
		const isOwner = await verifyProjectOwnership(userId, projectId);
		if (!isOwner) {
			throw new AppError("Project not found or access denied", 404);
		}

		// Sanitize filename để tránh path traversal
		const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "");

		const projectFolderPath = getProjectFolderPath(projectId);
		const filePath = path.join(projectFolderPath, sanitizedFilename);

		// Kiểm tra file có tồn tại không
		try {
			await fs.access(filePath);
		} catch {
			throw new AppError("Video file not found", 404);
		}

		// Xóa file
		await fs.unlink(filePath);

		res.status(200).json({
			success: true,
			message: "Video deleted successfully",
		});
	} catch (error) {
		next(error);
	}
};

