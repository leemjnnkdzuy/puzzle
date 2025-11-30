import express from "express";
import {
	getPreferences,
	updatePreferences,
	updateProfile,
	getUserProfile,
} from "@/controllers/userController";
import {authenticate} from "@/middlewares/auth";

const router = express.Router();

router.get("/preferences", authenticate, getPreferences);
router.put("/preferences", authenticate, updatePreferences);
router.put("/profile", authenticate, updateProfile);
router.get("/profile/:identifier", authenticate, getUserProfile);

export default router;
