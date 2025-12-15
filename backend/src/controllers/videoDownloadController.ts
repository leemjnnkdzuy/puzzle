import {Request, Response} from "express";
import {
	startDownload,
	getDownloadStatus,
	getAllDownloads,
	cancelDownload,
	deleteDownload,
	getDownloadFile,
	getVideoInfo,
} from "@/services/videoDownloadService";

export const initiateDownload = async (req: Request, res: Response) => {
	try {
		const {url, referer, filename} = req.body;

		if (!url) {
			return res.status(400).json({
				success: false,
				message: "URL is required",
			});
		}

		const task = await startDownload(url, referer, filename);

		res.json({
			success: true,
			message: "Download started",
			data: {
				taskId: task.id,
				status: task.status,
			},
		});
	} catch (error: any) {
		console.error("Download error:", error);
		res.status(500).json({
			success: false,
			message: error.message || "Failed to start download",
		});
	}
};

export const checkDownloadStatus = async (req: Request, res: Response) => {
	try {
		const {taskId} = req.params;

		const task = getDownloadStatus(taskId);

		if (!task) {
			return res.status(404).json({
				success: false,
				message: "Download task not found",
			});
		}

		res.json({
			success: true,
			data: {
				id: task.id,
				url: task.url,
				status: task.status,
				progress: task.progress,
				speed: task.speed,
				eta: task.eta,
				filename: task.filename,
				error: task.error,
			},
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

export const listDownloads = async (req: Request, res: Response) => {
	try {
		const downloads = getAllDownloads();

		res.json({
			success: true,
			data: downloads.map((task) => ({
				id: task.id,
				url: task.url,
				status: task.status,
				progress: task.progress,
				speed: task.speed,
				eta: task.eta,
				filename: task.filename,
				error: task.error,
				createdAt: task.createdAt,
			})),
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// Cancel a download
export const abortDownload = async (req: Request, res: Response) => {
	try {
		const {taskId} = req.params;

		const cancelled = cancelDownload(taskId);

		if (!cancelled) {
			return res.status(404).json({
				success: false,
				message: "Download task not found or already completed",
			});
		}

		res.json({
			success: true,
			message: "Download cancelled",
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// Delete a download
export const removeDownload = async (req: Request, res: Response) => {
	try {
		const {taskId} = req.params;

		const deleted = deleteDownload(taskId);

		if (!deleted) {
			return res.status(404).json({
				success: false,
				message: "Download task not found",
			});
		}

		res.json({
			success: true,
			message: "Download deleted",
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// Download completed file
export const downloadFile = async (req: Request, res: Response) => {
	try {
		const {taskId} = req.params;

		const file = getDownloadFile(taskId);

		if (!file) {
			return res.status(404).json({
				success: false,
				message: "File not found or download not completed",
			});
		}

		res.setHeader(
			"Content-Disposition",
			`attachment; filename="${encodeURIComponent(file.filename)}"`
		);
		res.setHeader("Content-Type", "application/octet-stream");

		file.stream.pipe(res);
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// Get video info (formats, resolution)
export const fetchVideoInfo = async (req: Request, res: Response) => {
	try {
		const {url, referer} = req.body;

		if (!url) {
			return res.status(400).json({
				success: false,
				message: "URL is required",
			});
		}

		const info = await getVideoInfo(url, referer);

		res.json({
			success: true,
			data: info,
		});
	} catch (error: any) {
		console.error("Get video info error:", error);
		res.status(500).json({
			success: false,
			message: error.message || "Failed to get video info",
		});
	}
};
