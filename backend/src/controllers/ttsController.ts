import {Response, NextFunction} from "express";
import mongoose from "mongoose";
import TTSHistory from "@/models/TTSHistory";
import User from "@/models/User";
import {AuthRequest} from "@/middlewares/auth";
import AppError from "@/utils/errors";
import ttsService from "@/services/ttsService";

export const generateSpeech = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?._id;
		if (!userId) {
			throw new AppError("User not found", 404);
		}

		const {text, voiceId, language, speed = 1.0, pitch = 0} = req.body;

		const user = await User.findById(userId).select("credit");
		if (!user) {
			throw new AppError("User not found", 404);
		}

		const cost = ttsService.calculateCost(text.length, voiceId);

		const currentCredit = user.credit || 0;
		if (currentCredit < cost) {
			throw new AppError(
				`Insufficient credit. Required: ${cost}, Available: ${currentCredit}`,
				402
			);
		}

		const voices = await ttsService.getVoices(language);
		const selectedVoice = voices.find((v) => v.id === voiceId);
		if (!selectedVoice) {
			throw new AppError("Voice not found", 404);
		}

		let audioUrl: string;
		let duration: number | undefined;

		try {
			const result = await ttsService.generateSpeech({
				text,
				voiceId,
				language: language || selectedVoice.language,
				speed,
				pitch,
			});
			audioUrl = result.audioUrl;
			duration = result.duration;
		} catch (error) {
			throw new AppError(
				error instanceof Error
					? error.message
					: "Failed to generate speech",
				500
			);
		}

		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{$inc: {credit: -cost}},
			{new: true}
		).select("credit");

		if (!updatedUser) {
			throw new AppError("Failed to update user credit", 500);
		}

		const historyItem = await TTSHistory.create({
			userId,
			text,
			voiceId,
			voiceName: selectedVoice.name,
			language: language || selectedVoice.language,
			speed,
			pitch,
			audioUrl,
			duration,
			cost,
		});

		res.status(200).json({
			success: true,
			message: "Speech generated successfully",
			data: {
				audioUrl,
				duration,
				text,
				voiceId,
			},
		});
	} catch (error) {
		next(error);
	}
};

export const getVoices = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const {language} = req.query;

		const voices = await ttsService.getVoices(
			language as string | undefined
		);

		res.status(200).json({
			success: true,
			data: {
				voices,
			},
		});
	} catch (error) {
		next(error);
	}
};

export const getHistory = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?._id;
		if (!userId) {
			throw new AppError("User not found", 404);
		}

		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 20;
		const skip = (page - 1) * limit;

		const total = await TTSHistory.countDocuments({userId});

		const items = await TTSHistory.find({userId})
			.sort({createdAt: -1})
			.skip(skip)
			.limit(limit)
			.select("-__v")
			.lean();

		res.status(200).json({
			success: true,
			data: {
				items,
				total,
				page,
				limit,
			},
		});
	} catch (error) {
		next(error);
	}
};

export const deleteHistoryItem = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?._id;
		if (!userId) {
			throw new AppError("User not found", 404);
		}

		const {id} = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			throw new AppError("Invalid history item ID", 400);
		}

		const historyItem = await TTSHistory.findOne({
			_id: id,
			userId,
		});

		if (!historyItem) {
			throw new AppError("History item not found", 404);
		}

		await TTSHistory.findByIdAndDelete(id);

		res.status(200).json({
			success: true,
			message: "History item deleted successfully",
		});
	} catch (error) {
		next(error);
	}
};
