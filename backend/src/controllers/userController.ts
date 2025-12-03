import {Response, NextFunction} from "express";
import mongoose from "mongoose";
import User from "@/models/User";
import {AuthRequest} from "@/middlewares/auth";
import AppError from "@/utils/errors";
import {generateVerificationCode} from "@/utils/generateToken";
import {
	sendChangeEmailVerificationCode,
	sendChangeUsernameVerificationCode,
} from "@/helpers/sendMailHelper";

export const getPreferences = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const user = await User.findById(req.user?._id).select(
			"theme language"
		);

		if (!user) {
			throw new AppError("User not found", 404);
		}

		res.status(200).json({
			success: true,
			data: {
				theme: user.theme || "light",
				language: user.language || "en",
			},
		});
	} catch (error) {
		next(error);
	}
};

export const updatePreferences = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const {theme, language} = req.body;

		const updateData: {theme?: string; language?: string} = {};

		if (theme !== undefined) {
			if (theme !== "light" && theme !== "dark") {
				throw new AppError("Theme must be 'light' or 'dark'", 400);
			}
			updateData.theme = theme;
		}

		if (language !== undefined) {
			if (language !== "en" && language !== "vi") {
				throw new AppError("Language must be 'en' or 'vi'", 400);
			}
			updateData.language = language;
		}

		if (Object.keys(updateData).length === 0) {
			throw new AppError(
				"At least one preference (theme or language) must be provided",
				400
			);
		}

		const user = await User.findByIdAndUpdate(
			req.user?._id,
			{$set: updateData},
			{new: true, runValidators: true}
		).select("theme language");

		if (!user) {
			throw new AppError("User not found", 404);
		}

		res.status(200).json({
			success: true,
			message: "Preferences updated successfully",
			data: {
				theme: user.theme || "light",
				language: user.language || "en",
			},
		});
	} catch (error) {
		next(error);
	}
};

export const updateProfile = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?._id;
		const {bio, socialLinks, first_name, last_name, avatar} = req.body;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		const updateData: {
			bio?: string;
			first_name?: string;
			last_name?: string;
			avatar?: string;
			socialLinks?: Array<{
				platform:
					| "website"
					| "facebook"
					| "tiktok"
					| "github"
					| "instagram"
					| "linkedin"
					| "youtube";
				url: string;
			}>;
		} = {};

		if (bio !== undefined) {
			if (typeof bio !== "string") {
				throw new AppError("Bio must be a string", 400);
			}
			if (bio.length > 500) {
				throw new AppError("Bio must not exceed 500 characters", 400);
			}
			updateData.bio = bio.trim();
		}

		if (first_name !== undefined) {
			if (typeof first_name !== "string") {
				throw new AppError("First name must be a string", 400);
			}
			if (first_name.trim().length === 0) {
				throw new AppError("First name cannot be empty", 400);
			}
			if (first_name.length > 50) {
				throw new AppError(
					"First name must not exceed 50 characters",
					400
				);
			}
			updateData.first_name = first_name.trim();
		}

		if (last_name !== undefined) {
			if (typeof last_name !== "string") {
				throw new AppError("Last name must be a string", 400);
			}
			if (last_name.trim().length === 0) {
				throw new AppError("Last name cannot be empty", 400);
			}
			if (last_name.length > 50) {
				throw new AppError(
					"Last name must not exceed 50 characters",
					400
				);
			}
			updateData.last_name = last_name.trim();
		}

		if (avatar !== undefined) {
			if (typeof avatar !== "string") {
				throw new AppError("Avatar must be a string", 400);
			}
			// Validate base64 image format: data:image/...;base64,...
			if (!avatar.match(/^data:image\/(jpeg|jpg|png|gif|webp);base64,/)) {
				throw new AppError(
					"Avatar must be a valid base64 image string (format: data:image/...;base64,...)",
					400
				);
			}
			updateData.avatar = avatar;
		}

		if (socialLinks !== undefined) {
			if (!Array.isArray(socialLinks)) {
				throw new AppError("Social links must be an array", 400);
			}

			const validPlatforms = [
				"website",
				"facebook",
				"tiktok",
				"github",
				"instagram",
				"linkedin",
				"youtube",
			];

			const validatedLinks = socialLinks.map((link: any) => {
				if (!link.platform || !link.url) {
					throw new AppError(
						"Each social link must have platform and url",
						400
					);
				}

				if (!validPlatforms.includes(link.platform)) {
					throw new AppError(
						`Invalid platform: ${
							link.platform
						}. Valid platforms are: ${validPlatforms.join(", ")}`,
						400
					);
				}

				if (typeof link.url !== "string" || !link.url.trim()) {
					throw new AppError("URL must be a non-empty string", 400);
				}

				return {
					platform: link.platform,
					url: link.url.trim(),
				};
			});

			updateData.socialLinks = validatedLinks;
		}

		if (Object.keys(updateData).length === 0) {
			throw new AppError(
				"At least one field (bio, first_name, last_name, avatar, or socialLinks) must be provided",
				400
			);
		}

		const user = await User.findByIdAndUpdate(
			userId,
			{$set: updateData},
			{new: true, runValidators: true}
		).select("-password -refreshToken -refreshTokenExpires");

		if (!user) {
			throw new AppError("User not found", 404);
		}

		res.status(200).json({
			success: true,
			message: "Profile updated successfully",
			data: {
				bio: user.bio || "",
				first_name: user.first_name || "",
				last_name: user.last_name || "",
				avatar: user.avatar,
				socialLinks: user.socialLinks || [],
			},
		});
	} catch (error) {
		next(error);
	}
};

export const getUserProfile = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const {identifier} = req.params;

		if (!identifier) {
			throw new AppError("User ID or username is required", 400);
		}

		let user;
		// Check if identifier is a valid ObjectId
		if (mongoose.Types.ObjectId.isValid(identifier)) {
			user = await User.findById(identifier).select(
				"-password -refreshToken -refreshTokenExpires -verificationCode -verificationCodeExpires -resetPasswordToken -resetPasswordExpires"
			);
		} else {
			// If not a valid ObjectId, treat it as username
			user = await User.findOne({
				username: identifier.toLowerCase(),
			}).select(
				"-password -refreshToken -refreshTokenExpires -verificationCode -verificationCodeExpires -resetPasswordToken -resetPasswordExpires"
			);
		}

		if (!user) {
			throw new AppError("User not found", 404);
		}

		res.status(200).json({
			success: true,
			data: {
				user: {
					_id: user._id,
					username: user.username,
					first_name: user.first_name,
					last_name: user.last_name,
					avatar: user.avatar,
					bio: user.bio || "",
					socialLinks: user.socialLinks || [],
					createdAt: user.createdAt,
				},
			},
		});
	} catch (error) {
		next(error);
	}
};

export const changePassword = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const {currentPassword, newPassword} = req.body;
		const userId = req.user?._id;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		const user = await User.findById(userId).select("+password");

		if (!user) {
			throw new AppError("User not found", 404);
		}

		const isPasswordValid = await user.comparePassword(currentPassword);

		if (!isPasswordValid) {
			throw new AppError("Current password is incorrect", 400);
		}

		user.password = newPassword;
		await user.save();

		res.status(200).json({
			success: true,
			message: "Password changed successfully",
		});
	} catch (error) {
		next(error);
	}
};

export const requestChangeEmailCurrent = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?._id;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		const user = await User.findById(userId);

		if (!user) {
			throw new AppError("User not found", 404);
		}

		const verificationCode = generateVerificationCode();
		user.verificationCode = verificationCode;
		user.verificationCodeExpires = new Date();
		user.verificationCodeExpires.setHours(
			user.verificationCodeExpires.getHours() + 1
		);

		await user.save();

		try {
			await sendChangeEmailVerificationCode(
				user.email,
				verificationCode,
				user.first_name,
				false
			);
		} catch (error) {
			user.verificationCode = undefined;
			user.verificationCodeExpires = undefined;
			await user.save();

			throw new AppError(
				"Failed to send verification code. Please try again later.",
				500
			);
		}

		res.status(200).json({
			success: true,
			message: "Verification code has been sent to your current email",
		});
	} catch (error) {
		next(error);
	}
};

export const verifyChangeEmailCurrent = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const {code} = req.body;
		const userId = req.user?._id;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		const user = await User.findById(userId);

		if (!user) {
			throw new AppError("User not found", 404);
		}

		if (
			!user.verificationCode ||
			user.verificationCode !== code ||
			!user.verificationCodeExpires ||
			user.verificationCodeExpires <= new Date()
		) {
			throw new AppError("Invalid or expired verification code", 400);
		}

		// Generate temp token for email change process
		const tempToken = generateVerificationCode();
		user.verificationCode = tempToken;
		user.verificationCodeExpires = new Date();
		user.verificationCodeExpires.setHours(
			user.verificationCodeExpires.getHours() + 1
		);

		await user.save();

		res.status(200).json({
			success: true,
			message: "Current email verified successfully",
			data: {
				tempToken,
			},
		});
	} catch (error) {
		next(error);
	}
};

export const requestChangeEmailNew = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const {newEmail, tempToken} = req.body;
		const userId = req.user?._id;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		const user = await User.findById(userId);

		if (!user) {
			throw new AppError("User not found", 404);
		}

		// Verify temp token
		if (
			!user.verificationCode ||
			user.verificationCode !== tempToken ||
			!user.verificationCodeExpires ||
			user.verificationCodeExpires <= new Date()
		) {
			throw new AppError(
				"Invalid or expired session. Please start over.",
				400
			);
		}

		const normalizedNewEmail = newEmail.toLowerCase().trim();

		// Check if new email is already in use
		const existingUser = await User.findOne({email: normalizedNewEmail});

		if (existingUser) {
			throw new AppError("Email is already in use", 400);
		}

		// Check if new email is same as current email
		if (user.email.toLowerCase() === normalizedNewEmail) {
			throw new AppError(
				"New email must be different from current email",
				400
			);
		}

		const verificationCode = generateVerificationCode();
		user.verificationCode = verificationCode;
		user.verificationCodeExpires = new Date();
		user.verificationCodeExpires.setHours(
			user.verificationCodeExpires.getHours() + 1
		);

		// Store new email temporarily in a field (we'll use a metadata approach)
		// For simplicity, we'll store it in verificationCode with a prefix
		// Actually, let's use a better approach - store in a temp field
		// Since we don't have a tempEmail field, we'll use a different approach
		// We'll store it in the request body and pass it to verify-new
		// Actually, let's add it to the user model temporarily or use metadata
		// For now, we'll require it to be sent again in verify-new

		await user.save();

		try {
			await sendChangeEmailVerificationCode(
				normalizedNewEmail,
				verificationCode,
				user.first_name,
				true
			);
		} catch (error) {
			user.verificationCode = undefined;
			user.verificationCodeExpires = undefined;
			await user.save();

			throw new AppError(
				"Failed to send verification code. Please try again later.",
				500
			);
		}

		res.status(200).json({
			success: true,
			message: "Verification code has been sent to your new email",
		});
	} catch (error) {
		next(error);
	}
};

export const verifyChangeEmailNew = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const {code, newEmail} = req.body;
		const userId = req.user?._id;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		const user = await User.findById(userId);

		if (!user) {
			throw new AppError("User not found", 404);
		}

		if (
			!user.verificationCode ||
			user.verificationCode !== code ||
			!user.verificationCodeExpires ||
			user.verificationCodeExpires <= new Date()
		) {
			throw new AppError("Invalid or expired verification code", 400);
		}

		const normalizedNewEmail = newEmail.toLowerCase().trim();

		// Check if new email is already in use
		const existingUser = await User.findOne({email: normalizedNewEmail});

		if (existingUser) {
			throw new AppError("Email is already in use", 400);
		}

		// Update email
		user.email = normalizedNewEmail;
		user.isEmailVerified = true;
		user.verificationCode = undefined;
		user.verificationCodeExpires = undefined;

		await user.save();

		res.status(200).json({
			success: true,
			message: "Email changed successfully",
			data: {
				email: user.email,
			},
		});
	} catch (error) {
		next(error);
	}
};

export const checkUsername = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const {username} = req.body;
		const userId = req.user?._id;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		const normalizedUsername = username.toLowerCase().trim();

		const existingUser = await User.findOne({
			username: normalizedUsername,
		});

		if (existingUser && existingUser._id.toString() !== userId.toString()) {
			res.status(200).json({
				success: true,
				available: false,
				message: "Username is already taken",
			});
			return;
		}

		// Check if it's the same as current username
		const currentUser = await User.findById(userId);
		if (currentUser && currentUser.username === normalizedUsername) {
			res.status(200).json({
				success: true,
				available: false,
				message: "This is your current username",
			});
			return;
		}

		res.status(200).json({
			success: true,
			available: true,
			message: "Username is available",
		});
	} catch (error) {
		next(error);
	}
};

export const requestChangeUsername = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?._id;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		const user = await User.findById(userId);

		if (!user) {
			throw new AppError("User not found", 404);
		}

		const verificationCode = generateVerificationCode();
		user.verificationCode = verificationCode;
		user.verificationCodeExpires = new Date();
		user.verificationCodeExpires.setHours(
			user.verificationCodeExpires.getHours() + 1
		);

		await user.save();

		try {
			await sendChangeUsernameVerificationCode(
				user.email,
				verificationCode,
				user.first_name
			);
		} catch (error) {
			user.verificationCode = undefined;
			user.verificationCodeExpires = undefined;
			await user.save();

			throw new AppError(
				"Failed to send verification code. Please try again later.",
				500
			);
		}

		res.status(200).json({
			success: true,
			message: "Verification code has been sent to your email",
		});
	} catch (error) {
		next(error);
	}
};

export const verifyChangeUsername = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const {username, code} = req.body;
		const userId = req.user?._id;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		const user = await User.findById(userId);

		if (!user) {
			throw new AppError("User not found", 404);
		}

		if (
			!user.verificationCode ||
			user.verificationCode !== code ||
			!user.verificationCodeExpires ||
			user.verificationCodeExpires <= new Date()
		) {
			throw new AppError("Invalid or expired verification code", 400);
		}

		const normalizedUsername = username.toLowerCase().trim();

		// Check if username is already in use
		const existingUser = await User.findOne({
			username: normalizedUsername,
		});

		if (existingUser && existingUser._id.toString() !== userId.toString()) {
			throw new AppError("Username is already taken", 400);
		}

		// Update username
		user.username = normalizedUsername;
		user.verificationCode = undefined;
		user.verificationCodeExpires = undefined;

		await user.save();

		res.status(200).json({
			success: true,
			message: "Username changed successfully",
			data: {
				username: user.username,
			},
		});
	} catch (error) {
		next(error);
	}
};
