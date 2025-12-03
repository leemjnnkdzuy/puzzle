import express from "express";
import {
	generateSpeech,
	getVoices,
	getHistory,
	deleteHistoryItem,
} from "@/controllers/ttsController";
import {authenticate} from "@/middlewares/auth";
import {validate} from "@/middlewares/validation";
import {generateSpeechValidator} from "@/validators/ttsValidators";

const router = express.Router();

router.post(
	"/generate",
	authenticate,
	validate(generateSpeechValidator),
	generateSpeech
);

router.get("/voices", authenticate, getVoices);

router.get("/history", authenticate, getHistory);

router.delete("/history/:id", authenticate, deleteHistoryItem);

export default router;
