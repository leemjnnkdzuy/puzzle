import express from "express";
import {
	getFullServiceProjects,
	getFullServiceProjectById,
	updateFullServiceProject,
	deleteFullServiceProject,
} from "@/controllers/fullServiceController";
import {updateFullServiceValidator} from "@/validators/fullServiceValidators";
import {validate} from "@/middlewares/validation";
import {authenticate} from "@/middlewares/auth";

const router = express.Router();

router.get("/", authenticate, getFullServiceProjects);
router.get("/:id", authenticate, getFullServiceProjectById);
router.put(
	"/:id",
	authenticate,
	validate(updateFullServiceValidator),
	updateFullServiceProject
);
router.delete("/:id", authenticate, deleteFullServiceProject);

export default router;