import express from "express";
import {
	register,
	login,
	forgotPassword,
	refreshToken,
	logout,
	getCurrentUser,
	verify,
	verifyResetPin,
	resetPassword,
} from "@/controllers/authController";
import {
	registerValidator,
	loginValidator,
	forgotPasswordValidator,
	refreshTokenValidator,
	verifyValidator,
	verifyResetPinValidator,
	resetPasswordValidator,
} from "@/validators/authValidators";
import {validate} from "@/middlewares/validation";
import {authenticate} from "@/middlewares/auth";

const router = express.Router();

router.post("/register", validate(registerValidator), register);
router.post("/login", validate(loginValidator), login);
router.post(
	"/forgot-password",
	validate(forgotPasswordValidator),
	forgotPassword
);
router.post("/verify", validate(verifyValidator), verify);
router.post(
	"/verify-reset-pin",
	validate(verifyResetPinValidator),
	verifyResetPin
);
router.post("/reset-password", validate(resetPasswordValidator), resetPassword);
router.post("/refresh-token", validate(refreshTokenValidator), refreshToken);

router.post("/logout", authenticate, logout);
router.get("/me", authenticate, getCurrentUser);

export default router;
