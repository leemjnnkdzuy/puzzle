import express from "express";
import {
	initiateDownload,
	checkDownloadStatus,
	listDownloads,
	abortDownload,
	removeDownload,
	downloadFile,
	fetchVideoInfo,
} from "@/controllers/videoDownloadController";

const router = express.Router();

// POST /api/video-download/info - Get video info (formats, resolution)
router.post("/info", fetchVideoInfo);

// POST /api/video-download - Start a new download
router.post("/", initiateDownload);

// GET /api/video-download - List all downloads
router.get("/", listDownloads);

// GET /api/video-download/:taskId - Get download status
router.get("/:taskId", checkDownloadStatus);

// GET /api/video-download/:taskId/file - Download completed file
router.get("/:taskId/file", downloadFile);

// DELETE /api/video-download/:taskId - Cancel and delete download
router.delete("/:taskId", removeDownload);

// POST /api/video-download/:taskId/cancel - Cancel download
router.post("/:taskId/cancel", abortDownload);

export default router;
