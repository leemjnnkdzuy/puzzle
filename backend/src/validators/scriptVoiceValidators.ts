import {body} from "express-validator";

export const createScriptVoiceValidator = [
	body("title")
		.trim()
		.notEmpty()
		.withMessage("Title is required")
		.isLength({min: 1, max: 200})
		.withMessage("Title must be between 1 and 200 characters"),
	body("description")
		.trim()
		.notEmpty()
		.withMessage("Description is required")
		.isLength({max: 1000})
		.withMessage("Description must not exceed 1000 characters"),
	body("scriptContent")
		.optional()
		.isString()
		.withMessage("Script content must be a string"),
	body("voiceSettings.voiceId")
		.optional()
		.isString()
		.withMessage("Voice ID must be a string"),
	body("voiceSettings.voiceName")
		.optional()
		.isString()
		.withMessage("Voice name must be a string"),
	body("voiceSettings.speed")
		.optional()
		.isFloat({min: 0.5, max: 2.0})
		.withMessage("Speed must be between 0.5 and 2.0"),
	body("voiceSettings.pitch")
		.optional()
		.isInt({min: -20, max: 20})
		.withMessage("Pitch must be between -20 and 20"),
	body("voiceSettings.volume")
		.optional()
		.isInt({min: 0, max: 100})
		.withMessage("Volume must be between 0 and 100"),
	body("language")
		.optional()
		.isString()
		.withMessage("Language must be a string"),
];

export const updateScriptVoiceValidator = [
	body("title")
		.optional()
		.trim()
		.isLength({min: 1, max: 200})
		.withMessage("Title must be between 1 and 200 characters"),
	body("description")
		.optional()
		.trim()
		.isLength({max: 1000})
		.withMessage("Description must not exceed 1000 characters"),
	body("thumbnail")
		.optional()
		.isString()
		.withMessage("Thumbnail must be a string"),
	body("status")
		.optional()
		.isIn(["pending", "processing", "completed", "failed"])
		.withMessage(
			"Status must be one of: pending, processing, completed, failed"
		),
	body("scriptContent")
		.optional()
		.isString()
		.withMessage("Script content must be a string"),
	body("voiceSettings")
		.optional()
		.isObject()
		.withMessage("Voice settings must be an object"),
	body("audioUrl")
		.optional()
		.isString()
		.withMessage("Audio URL must be a string"),
	body("audioDuration")
		.optional()
		.isNumeric()
		.withMessage("Audio duration must be a number")
		.custom((value) => {
			if (value !== undefined && value < 0) {
				throw new Error("Audio duration must be non-negative");
			}
			return true;
		}),
	body("language")
		.optional()
		.isString()
		.withMessage("Language must be a string"),
];

