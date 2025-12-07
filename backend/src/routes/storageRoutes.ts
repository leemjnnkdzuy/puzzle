import express from "express";
import {getStorageInfo, upgradeStorage, getProjectsStorage} from "@/controllers/storageController";
import {authenticate} from "@/middlewares/auth";

const router = express.Router();

router.get("/", authenticate, getStorageInfo);
router.get("/projects", authenticate, getProjectsStorage);
router.post("/upgrade", authenticate, upgradeStorage);

export default router;
