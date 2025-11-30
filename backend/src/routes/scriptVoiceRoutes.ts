import express from "express";
import {
	getScriptVoiceProjects,
	getScriptVoiceProjectById,
	updateScriptVoiceProject,
	deleteScriptVoiceProject,
} from "@/controllers/scriptVoiceController";
import {updateScriptVoiceValidator} from "@/validators/scriptVoiceValidators";
import {validate} from "@/middlewares/validation";
import {authenticate} from "@/middlewares/auth";

const router = express.Router();

router.get("/", authenticate, getScriptVoiceProjects);
router.get("/:id", authenticate, getScriptVoiceProjectById);
router.put(
	"/:id",
	authenticate,
	validate(updateScriptVoiceValidator),
	updateScriptVoiceProject
);
router.delete("/:id", authenticate, deleteScriptVoiceProject);

export default router;
