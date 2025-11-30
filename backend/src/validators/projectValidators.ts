import {body} from "express-validator";

export const createProjectValidator = [
	body("title")
		.trim()
		.notEmpty()
		.withMessage("Title is required")
		.isLength({min: 1, max: 200})
		.withMessage("Title must be between 1 and 200 characters"),
	body("description")
		.optional()
		.trim()
		.isLength({max: 1000})
		.withMessage("Description must not exceed 1000 characters"),
	body("type")
		.notEmpty()
		.withMessage("Project type is required")
		.isIn(["script_generation", "script_voice", "full_service"])
		.withMessage(
			"Project type must be one of: script_generation, script_voice, full_service"
		),
];

export const updateProjectValidator = [
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
];
