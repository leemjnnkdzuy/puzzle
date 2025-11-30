import express from "express";
import {
	getScriptGenerationProjects,
	getScriptGenerationProjectById,
	updateScriptGenerationProject,
	deleteScriptGenerationProject,
} from "@/controllers/scriptGenerationController";
import {updateScriptGenerationValidator} from "@/validators/scriptGenerationValidators";
import {validate} from "@/middlewares/validation";
import {authenticate} from "@/middlewares/auth";

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

export default router;
