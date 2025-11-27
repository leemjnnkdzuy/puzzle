import {useCallback} from "react";

type NotificationType = "success" | "error" | "info" | "warning";

interface Notification {
	id: string;
	message: string;
	type: NotificationType;
}

// Simple in-memory store for notifications
let notifications: Notification[] = [];
let listeners: Array<() => void> = [];

const notify = () => {
	listeners.forEach((listener) => listener());
};

const addNotification = (message: string, type: NotificationType) => {
	const id = Date.now().toString();
	const notification: Notification = {id, message, type};
	notifications = [...notifications, notification];
	notify();

	// Auto remove after 5 seconds
	setTimeout(() => {
		removeNotification(id);
	}, 5000);
};

const removeNotification = (id: string) => {
	notifications = notifications.filter((n) => n.id !== id);
	notify();
};

// Export removeNotification for use in UI component
export {removeNotification};

export const useGlobalNotificationPopup = () => {
	const showSuccess = useCallback((message: string) => {
		addNotification(message, "success");
		// Also log to console for development
		console.log(`✅ ${message}`);
	}, []);

	const showError = useCallback((message: string) => {
		addNotification(message, "error");
		// Also log to console for development
		console.error(`❌ ${message}`);
	}, []);

	const showInfo = useCallback((message: string) => {
		addNotification(message, "info");
		console.log(`ℹ️ ${message}`);
	}, []);

	const showWarning = useCallback((message: string) => {
		addNotification(message, "warning");
		console.warn(`⚠️ ${message}`);
	}, []);

	return {
		showSuccess,
		showError,
		showInfo,
		showWarning,
	};
};

// Export notification store for potential UI component
export const getNotifications = (): Notification[] => notifications;

export const subscribe = (listener: () => void) => {
	listeners = [...listeners, listener];
	return () => {
		listeners = listeners.filter((l) => l !== listener);
	};
};
