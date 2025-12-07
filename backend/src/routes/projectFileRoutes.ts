import express from "express";
import {
	uploadVideo,
	getVideo,
	listVideos,
	deleteVideo,
} from "@/controllers/projectFileController";
import {authenticate} from "@/middlewares/auth";
import {uploadVideoStreamSingle} from "@/middlewares/uploadVideoStream";

const router = express.Router();

router.post(
	"/:id/files/upload",
	authenticate,
	uploadVideoStreamSingle,
	uploadVideo
);

router.get("/:id/files", authenticate, listVideos);

router.get("/:id/files/:filename", authenticate, getVideo);

router.delete("/:id/files/:filename", authenticate, deleteVideo);

export default router;

