import express from "express";
import {
	getScriptGenerationProjects,
	getScriptGenerationProjectById,
	updateScriptGenerationProject,
	deleteScriptGenerationProject,
	uploadScriptGenerationVideo,
	uploadScriptGenerationVideos,
	getScriptGenerationVideos,
	getScriptGenerationVideo,
	deleteScriptGenerationVideo,
	updateScriptGenerationVideoOrder,
	getScriptGenerationVideoToken,
} from "@/controllers/scriptGenerationController";
import {updateScriptGenerationValidator} from "@/validators/scriptGenerationValidators";
import {validate} from "@/middlewares/validation";
import {authenticate} from "@/middlewares/auth";
import {
	uploadVideoStreamSingle,
	uploadVideoStreamArray,
} from "@/middlewares/uploadVideoStream";

const router = express.Router();

router.get("/", authenticate, getScriptGenerationProjects);
router.get("/:id", authenticate, getScriptGenerationProjectById);
router.put(
	"/:id",
	authenticate,
	validate(updateScriptGenerationValidator),
	updateScriptGenerationProject
);
router.delete("/:id", authenticate, deleteScriptGenerationProject);

router.post(
	"/:id/videos/upload",
	authenticate,
	uploadVideoStreamSingle,
	uploadScriptGenerationVideo
);
router.post(
	"/:id/videos/upload-multiple",
	authenticate,
	uploadVideoStreamArray("videos", 50),
	uploadScriptGenerationVideos
);
router.get("/:id/videos", authenticate, getScriptGenerationVideos);
router.get("/:id/videos/:filename", authenticate, getScriptGenerationVideo);
router.get("/:id/videos/:filename", authenticate, getScriptGenerationVideo);
router.get("/:id/videos/:filename/token", authenticate, getScriptGenerationVideoToken);
router.delete(
	"/:id/videos/:filename",
	authenticate,
	deleteScriptGenerationVideo
);
router.put("/:id/videos/order", authenticate, updateScriptGenerationVideoOrder);

export default router;
