import express from "express";
import {
	getPreferences,
	updatePreferences,
	updateProfile,
	getUserProfile,
	changePassword,
	requestChangeEmailCurrent,
	verifyChangeEmailCurrent,
	requestChangeEmailNew,
	verifyChangeEmailNew,
	checkUsername,
	requestChangeUsername,
	verifyChangeUsername,
} from "@/controllers/userController";
import {authenticate} from "@/middlewares/auth";
import {validate} from "@/middlewares/validation";
import {
	changePasswordValidator,
	changeEmailRequestCurrentValidator,
	changeEmailVerifyCurrentValidator,
	changeEmailRequestNewValidator,
	changeEmailVerifyNewValidator,
	changeUsernameCheckValidator,
	changeUsernameRequestValidator,
	changeUsernameVerifyValidator,
} from "@/validators/userValidators";

const router = express.Router();

router.get("/preferences", authenticate, getPreferences);
router.put("/preferences", authenticate, updatePreferences);
router.put("/profile", authenticate, updateProfile);
router.get("/profile/:identifier", authenticate, getUserProfile);

router.put(
	"/change-password",
	authenticate,
	validate(changePasswordValidator),
	changePassword
);

router.post(
	"/change-email/request-current",
	authenticate,
	validate(changeEmailRequestCurrentValidator),
	requestChangeEmailCurrent
);
router.post(
	"/change-email/verify-current",
	authenticate,
	validate(changeEmailVerifyCurrentValidator),
	verifyChangeEmailCurrent
);
router.post(
	"/change-email/request-new",
	authenticate,
	validate(changeEmailRequestNewValidator),
	requestChangeEmailNew
);
router.post(
	"/change-email/verify-new",
	authenticate,
	validate(changeEmailVerifyNewValidator),
	verifyChangeEmailNew
);

router.post(
	"/change-username/check",
	authenticate,
	validate(changeUsernameCheckValidator),
	checkUsername
);
router.post(
	"/change-username/request",
	authenticate,
	validate(changeUsernameRequestValidator),
	requestChangeUsername
);
router.post(
	"/change-username/verify",
	authenticate,
	validate(changeUsernameVerifyValidator),
	verifyChangeUsername
);

export default router;
