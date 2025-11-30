import express from "express";
import {getPreferences, updatePreferences} from "@/controllers/userController";
import {authenticate} from "@/middlewares/auth";

const router = express.Router();

router.get("/preferences", authenticate, getPreferences);
router.put("/preferences", authenticate, updatePreferences);

export default router;
