import {body} from "express-validator";

export const generateSpeechValidator = [
	body("text")
		.trim()
		.notEmpty()
		.withMessage("Text is required")
		.isLength({min: 1, max: 5000})
		.withMessage("Text must be between 1 and 5000 characters"),
	body("voiceId")
		.trim()
		.notEmpty()
		.withMessage("Voice ID is required")
		.isString()
		.withMessage("Voice ID must be a string"),
	body("language")
		.optional()
		.trim()
		.isString()
		.withMessage("Language must be a string"),
	body("speed")
		.optional()
		.isFloat({min: 0.5, max: 2.0})
		.withMessage("Speed must be between 0.5 and 2.0")
		.toFloat(),
	body("pitch")
		.optional()
		.isInt({min: -12, max: 12})
		.withMessage("Pitch must be between -12 and 12")
		.toInt(),
];
