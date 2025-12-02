import {body} from "express-validator";

export const changePasswordValidator = [
	body("currentPassword")
		.notEmpty()
		.withMessage("Current password is required"),
	body("newPassword")
		.isLength({min: 6})
		.withMessage("Password must be at least 6 characters")
		.matches(/[A-Z]/)
		.withMessage("Password must contain at least one uppercase letter")
		.matches(/[a-z]/)
		.withMessage("Password must contain at least one lowercase letter")
		.matches(/[0-9]/)
		.withMessage("Password must contain at least one number"),
];

export const changeEmailRequestCurrentValidator = [];

export const changeEmailVerifyCurrentValidator = [
	body("code")
		.trim()
		.notEmpty()
		.withMessage("Verification code is required")
		.isLength({min: 6, max: 6})
		.withMessage("Verification code must be 6 characters"),
];

export const changeEmailRequestNewValidator = [
	body("newEmail")
		.trim()
		.isEmail()
		.withMessage("Please enter a valid email")
		.normalizeEmail(),
];

export const changeEmailVerifyNewValidator = [
	body("code")
		.trim()
		.notEmpty()
		.withMessage("Verification code is required")
		.isLength({min: 6, max: 6})
		.withMessage("Verification code must be 6 characters"),
];

export const changeUsernameCheckValidator = [
	body("username")
		.trim()
		.isLength({min: 6})
		.withMessage("Username must be at least 6 characters")
		.matches(/^[a-z0-9_.-]+$/)
		.withMessage(
			"Username can only contain a-z, 0-9, underscore (_), hyphen (-) and dot (.)"
		),
];

export const changeUsernameRequestValidator = [];

export const changeUsernameVerifyValidator = [
	body("username")
		.trim()
		.isLength({min: 6})
		.withMessage("Username must be at least 6 characters")
		.matches(/^[a-z0-9_.-]+$/)
		.withMessage(
			"Username can only contain a-z, 0-9, underscore (_), hyphen (-) and dot (.)"
		),
	body("code")
		.trim()
		.notEmpty()
		.withMessage("Verification code is required")
		.isLength({min: 6, max: 6})
		.withMessage("Verification code must be 6 characters"),
];
