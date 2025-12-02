import {useState, useEffect, useCallback} from "react";
import NotificationService, {
	type Notification,
} from "@/services/NotificationService";
import {useSSE, type SSEMessage} from "./useSSE";

interface UseNotificationsReturn {
	notifications: Notification[];
	unreadCount: number;
	loading: boolean;
	error: string | null;
	refreshNotifications: () => Promise<void>;
	markAsRead: (id: string) => Promise<void>;
	markAllAsRead: () => Promise<void>;
	deleteNotification: (id: string) => Promise<void>;
}

export const useNotifications = (
	limit: number = 50,
	skip: number = 0,
	autoRefresh: boolean = true
): UseNotificationsReturn => {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [unreadCount, setUnreadCount] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const {onMessage, offMessage} = useSSE();

	const fetchNotifications = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await NotificationService.getNotifications(
				limit,
				skip,
				false
			);
			setNotifications(data.notifications);
			setUnreadCount(data.unreadCount);
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "Failed to fetch notifications";
			setError(errorMessage);
			console.error("Error fetching notifications:", err);
		} finally {
			setLoading(false);
		}
	}, [limit, skip]);

	const fetchUnreadCount = useCallback(async () => {
		try {
			const count = await NotificationService.getUnreadCount();
			setUnreadCount(count);
		} catch (err) {
			console.error("Error fetching unread count:", err);
		}
	}, []);

	useEffect(() => {
		fetchNotifications();
		if (autoRefresh) {
			fetchUnreadCount();
		}
	}, [fetchNotifications, fetchUnreadCount, autoRefresh]);

	useEffect(() => {
		const handleSSEMessage = (message: SSEMessage) => {
			if (message.type === "notification") {
				const notification = message.data as Notification;
				setNotifications((prev) => [notification, ...prev]);
				setUnreadCount((prev) => prev + 1);
			} else if (message.type === "unread-count") {
				const data = message.data as {count: number};
				setUnreadCount(data.count);
			}
		};

		onMessage(handleSSEMessage);

		return () => {
			offMessage(handleSSEMessage);
		};
	}, [onMessage, offMessage]);

	const markAsRead = useCallback(async (id: string) => {
		try {
			await NotificationService.markAsRead(id);
			setNotifications((prev) =>
				prev.map((notif) =>
					notif.id === id ? {...notif, read: true} : notif
				)
			);
			setUnreadCount((prev) => Math.max(0, prev - 1));
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "Failed to mark notification as read";
			setError(errorMessage);
			throw err;
		}
	}, []);

	const markAllAsRead = useCallback(async () => {
		try {
			await NotificationService.markAllAsRead();
			setNotifications((prev) =>
				prev.map((notif) => ({...notif, read: true}))
			);
			setUnreadCount(0);
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "Failed to mark all notifications as read";
			setError(errorMessage);
			throw err;
		}
	}, []);

	const deleteNotification = useCallback(
		async (id: string) => {
			try {
				await NotificationService.deleteNotification(id);
				const deletedNotif = notifications.find((n) => n.id === id);
				setNotifications((prev) =>
					prev.filter((notif) => notif.id !== id)
				);
				if (deletedNotif && !deletedNotif.read) {
					setUnreadCount((prev) => Math.max(0, prev - 1));
				}
			} catch (err) {
				const errorMessage =
					err instanceof Error
						? err.message
						: "Failed to delete notification";
				setError(errorMessage);
				throw err;
			}
		},
		[notifications]
	);

	const refreshNotifications = useCallback(async () => {
		await fetchNotifications();
		await fetchUnreadCount();
	}, [fetchNotifications, fetchUnreadCount]);

	return {
		notifications,
		unreadCount,
		loading,
		error,
		refreshNotifications,
		markAsRead,
		markAllAsRead,
		deleteNotification,
	};
};
