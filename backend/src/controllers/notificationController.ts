import {Response, NextFunction} from "express";
import mongoose from "mongoose";
import Notification, {INotification} from "@/models/Notification";
import User from "@/models/User";
import {AuthRequest} from "@/middlewares/auth";
import AppError from "@/utils/errors";
import sseServer from "@/utils/sseServer";

export const getNotifications = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?._id;
		const {limit = 50, skip = 0, unreadOnly} = req.query;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		const query: any = {userId};
		if (unreadOnly === "true") {
			query.read = false;
		}

		const notifications = await Notification.find(query)
			.sort({createdAt: -1})
			.limit(Number(limit))
			.skip(Number(skip))
			.select("-__v");

		const total = await Notification.countDocuments(query);
		const unreadCount = await Notification.countDocuments({
			userId,
			read: false,
		});

		const transformedNotifications = notifications.map((notif) => ({
			id: notif._id.toString(),
			userId: notif.userId.toString(),
			title: notif.title,
			message: notif.message,
			type: notif.type,
			read: notif.read,
			link: notif.link,
			metadata: notif.metadata,
			createdAt: notif.createdAt,
			updatedAt: notif.updatedAt,
		}));

		res.status(200).json({
			success: true,
			data: {
				notifications: transformedNotifications,
				total,
				unreadCount,
			},
		});
	} catch (error) {
		next(error);
	}
};

export const getUnreadCount = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?._id;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		const unreadCount = await Notification.countDocuments({
			userId,
			read: false,
		});

		res.status(200).json({
			success: true,
			data: {
				unreadCount,
			},
		});
	} catch (error) {
		next(error);
	}
};

export const markAsRead = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?._id;
		const {id} = req.params;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		if (!id) {
			throw new AppError("Notification ID is required", 400);
		}

		if (!mongoose.Types.ObjectId.isValid(id)) {
			throw new AppError(`Invalid notification ID format: ${id}`, 400);
		}

		const notification = await Notification.findOneAndUpdate(
			{_id: id, userId},
			{read: true},
			{new: true}
		);

		if (!notification) {
			throw new AppError("Notification not found", 404);
		}

		const unreadCount = await Notification.countDocuments({
			userId,
			read: false,
		});
		sseServer.sendUnreadCount(userId.toString(), unreadCount);

		const transformedNotification = {
			id: notification._id.toString(),
			userId: notification.userId.toString(),
			title: notification.title,
			message: notification.message,
			type: notification.type,
			read: notification.read,
			link: notification.link,
			metadata: notification.metadata,
			createdAt: notification.createdAt,
			updatedAt: notification.updatedAt,
		};

		res.status(200).json({
			success: true,
			message: "Notification marked as read",
			data: transformedNotification,
		});
	} catch (error) {
		next(error);
	}
};

export const markAllAsRead = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?._id;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		const result = await Notification.updateMany(
			{userId, read: false},
			{read: true}
		);

		sseServer.sendUnreadCount(userId.toString(), 0);

		res.status(200).json({
			success: true,
			message: "All notifications marked as read",
			data: {
				modifiedCount: result.modifiedCount,
			},
		});
	} catch (error) {
		next(error);
	}
};

export const deleteNotification = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?._id;
		const {id} = req.params;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		if (!id) {
			throw new AppError("Notification ID is required", 400);
		}

		if (!mongoose.Types.ObjectId.isValid(id)) {
			throw new AppError(`Invalid notification ID format: ${id}`, 400);
		}

		const notification = await Notification.findOneAndDelete({
			_id: id,
			userId,
		});

		if (!notification) {
			throw new AppError("Notification not found", 404);
		}

		await User.findByIdAndUpdate(userId, {
			$pull: {notifications: id},
		});

		const unreadCount = await Notification.countDocuments({
			userId,
			read: false,
		});
		sseServer.sendUnreadCount(userId.toString(), unreadCount);

		res.status(200).json({
			success: true,
			message: "Notification deleted successfully",
		});
	} catch (error) {
		next(error);
	}
};

export const streamNotifications = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?._id;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		sseServer.addClient(userId.toString(), res);

		const unreadCount = await Notification.countDocuments({
			userId,
			read: false,
		});
		sseServer.sendUnreadCount(userId.toString(), unreadCount);
	} catch (error) {
		next(error);
	}
};

export const createNotification = async (
	userId: string,
	title: string,
	message: string,
	type: "info" | "success" | "warning" | "error" = "info",
	link?: string,
	metadata?: Record<string, any>
): Promise<INotification> => {
	const notification = new Notification({
		userId,
		title,
		message,
		type,
		link,
		metadata,
	});

	await notification.save();

	await User.findByIdAndUpdate(userId, {
		$push: {notifications: notification._id},
	});

	const notificationData = {
		id: notification._id.toString(),
		userId: notification.userId.toString(),
		title: notification.title,
		message: notification.message,
		type: notification.type,
		read: notification.read,
		link: notification.link,
		metadata: notification.metadata,
		createdAt: notification.createdAt,
		updatedAt: notification.updatedAt,
	};

	sseServer.sendNotification(userId, notificationData);

	const unreadCount = await Notification.countDocuments({
		userId,
		read: false,
	});
	sseServer.sendUnreadCount(userId, unreadCount);

	return notification;
};
