import {Response, NextFunction} from "express";
import mongoose from "mongoose";
import User from "@/models/User";
import {AuthRequest} from "@/middlewares/auth";
import AppError from "@/utils/errors";

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
		const {bio, socialLinks} = req.body;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		const updateData: {
			bio?: string;
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
				"At least one field (bio or socialLinks) must be provided",
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
