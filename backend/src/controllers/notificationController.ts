import {Response, NextFunction} from "express";
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

		res.status(200).json({
			success: true,
			data: {
				notifications,
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

		const notification = await Notification.findOneAndUpdate(
			{_id: id, userId},
			{read: true},
			{new: true}
		);

		if (!notification) {
			throw new AppError("Notification not found", 404);
		}

		// Emit unread count update via SSE
		const unreadCount = await Notification.countDocuments({
			userId,
			read: false,
		});
		sseServer.sendUnreadCount(userId.toString(), unreadCount);

		res.status(200).json({
			success: true,
			message: "Notification marked as read",
			data: notification,
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

		// Emit unread count update via SSE (should be 0 now)
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

		const notification = await Notification.findOneAndDelete({
			_id: id,
			userId,
		});

		if (!notification) {
			throw new AppError("Notification not found", 404);
		}

		// Remove from user's notifications array
		await User.findByIdAndUpdate(userId, {
			$pull: {notifications: id},
		});

		// Update unread count via SSE
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

		// Add client to SSE server
		sseServer.addClient(userId.toString(), res);

		// Send initial unread count
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

	// Add to user's notifications array
	await User.findByIdAndUpdate(userId, {
		$push: {notifications: notification._id},
	});

	// Emit realtime notification via SSE
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

	// Also emit unread count update
	const unreadCount = await Notification.countDocuments({
		userId,
		read: false,
	});
	sseServer.sendUnreadCount(userId, unreadCount);

	return notification;
};
