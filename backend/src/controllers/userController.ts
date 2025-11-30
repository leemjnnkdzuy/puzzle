import {Response, NextFunction} from "express";
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
