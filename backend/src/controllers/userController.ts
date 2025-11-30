import {Response} from "express";
import User from "@/models/User";
import {AuthRequest} from "@/middlewares/auth";

export const getPreferences = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const user = await User.findById(req.user?._id).select(
			"theme language"
		);

		if (!user) {
			res.status(404).json({
				success: false,
				message: "User not found",
			});
			return;
		}

		res.status(200).json({
			success: true,
			data: {
				theme: user.theme || "light",
				language: user.language || "en",
			},
		});
	} catch (error) {
		console.error("Get preferences error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to get preferences",
		});
	}
};

export const updatePreferences = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const {theme, language} = req.body;

		const updateData: {theme?: string; language?: string} = {};

		if (theme !== undefined) {
			if (theme !== "light" && theme !== "dark") {
				res.status(400).json({
					success: false,
					message: "Theme must be 'light' or 'dark'",
				});
				return;
			}
			updateData.theme = theme;
		}

		if (language !== undefined) {
			if (language !== "en" && language !== "vi") {
				res.status(400).json({
					success: false,
					message: "Language must be 'en' or 'vi'",
				});
				return;
			}
			updateData.language = language;
		}

		if (Object.keys(updateData).length === 0) {
			res.status(400).json({
				success: false,
				message:
					"At least one preference (theme or language) must be provided",
			});
			return;
		}

		const user = await User.findByIdAndUpdate(
			req.user?._id,
			{$set: updateData},
			{new: true, runValidators: true}
		).select("theme language");

		if (!user) {
			res.status(404).json({
				success: false,
				message: "User not found",
			});
			return;
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
		console.error("Update preferences error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to update preferences",
		});
	}
};
