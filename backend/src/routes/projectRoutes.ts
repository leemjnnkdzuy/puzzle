import express from "express";
import {
	getProjects,
	createProject,
	getProjectById,
	updateProject,
	deleteProject,
} from "@/controllers/projectController";
import {
	createProjectValidator,
	updateProjectValidator,
} from "@/validators/projectValidators";
import {validate} from "@/middlewares/validation";
import {authenticate} from "@/middlewares/auth";

const router = express.Router();

router.get("/", authenticate, getProjects);
router.post(
	"/",
	authenticate,
	validate(createProjectValidator),
	createProject
);
router.get("/:id", authenticate, getProjectById);
router.put(
	"/:id",
	authenticate,
	validate(updateProjectValidator),
	updateProject
);
router.delete("/:id", authenticate, deleteProject);

export default router;

