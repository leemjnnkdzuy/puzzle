import {body} from "express-validator";

export const registerValidator = [
	body("username")
		.trim()
		.isLength({min: 6})
		.withMessage("Username must be at least 6 characters")
		.matches(/^[a-z0-9_.-]+$/)
		.withMessage(
			"Username can only contain a-z, 0-9, underscore (_), hyphen (-) and dot (.)"
		),
	body("email")
		.trim()
		.isEmail()
		.withMessage("Please enter a valid email")
		.normalizeEmail(),
	body("password")
		.isLength({min: 6})
		.withMessage("Password must be at least 6 characters")
		.matches(/[A-Z]/)
		.withMessage("Password must contain at least one uppercase letter")
		.matches(/[a-z]/)
		.withMessage("Password must contain at least one lowercase letter")
		.matches(/[0-9]/)
		.withMessage("Password must contain at least one number"),
	body("first_name")
		.trim()
		.isLength({min: 2})
		.withMessage("First name must be at least 2 characters"),
	body("last_name")
		.trim()
		.isLength({min: 2})
		.withMessage("Last name must be at least 2 characters"),
];

export const loginValidator = [
	body("username").trim().notEmpty().withMessage("Username is required"),
	body("password").notEmpty().withMessage("Password is required"),
];

export const forgotPasswordValidator = [
	body("email")
		.trim()
		.isEmail()
		.withMessage("Please enter a valid email")
		.normalizeEmail(),
];

export const refreshTokenValidator = [];

export const verifyValidator = [
	body("code")
		.trim()
		.notEmpty()
		.withMessage("Verification code is required")
		.isLength({min: 6, max: 6})
		.withMessage("Verification code must be 6 characters"),
];

export const verifyResetPinValidator = [
	body("email")
		.trim()
		.isEmail()
		.withMessage("Please enter a valid email")
		.normalizeEmail(),
	body("code")
		.trim()
		.notEmpty()
		.withMessage("Verification code is required")
		.isLength({min: 6, max: 6})
		.withMessage("Verification code must be 6 characters"),
];

export const resetPasswordValidator = [
	body("resetToken").trim().notEmpty().withMessage("Reset token is required"),
	body("password")
		.isLength({min: 6})
		.withMessage("Password must be at least 6 characters")
		.matches(/[A-Z]/)
		.withMessage("Password must contain at least one uppercase letter")
		.matches(/[a-z]/)
		.withMessage("Password must contain at least one lowercase letter")
		.matches(/[0-9]/)
		.withMessage("Password must contain at least one number"),
];
