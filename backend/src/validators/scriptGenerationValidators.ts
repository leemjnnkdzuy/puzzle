import {body} from "express-validator";

export const createScriptGenerationValidator = [
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
	body("videoUrl")
		.optional()
		.isString()
		.withMessage("Video URL must be a string"),
	body("videoDuration")
		.optional()
		.isNumeric()
		.withMessage("Video duration must be a number")
		.custom((value) => {
			if (value !== undefined && value < 0) {
				throw new Error("Video duration must be non-negative");
			}
			return true;
		}),
	body("generationSettings.tone")
		.optional()
		.isString()
		.withMessage("Tone must be a string"),
	body("generationSettings.style")
		.optional()
		.isString()
		.withMessage("Style must be a string"),
	body("generationSettings.length")
		.optional()
		.isString()
		.withMessage("Length must be a string"),
];

export const updateScriptGenerationValidator = [
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
	body("scriptLanguage")
		.optional()
		.isString()
		.withMessage("Script language must be a string"),
	body("videoUrl")
		.optional()
		.isString()
		.withMessage("Video URL must be a string"),
	body("videoDuration")
		.optional()
		.isNumeric()
		.withMessage("Video duration must be a number")
		.custom((value) => {
			if (value !== undefined && value < 0) {
				throw new Error("Video duration must be non-negative");
			}
			return true;
		}),
	body("generationSettings")
		.optional()
		.isObject()
		.withMessage("Generation settings must be an object"),
];

