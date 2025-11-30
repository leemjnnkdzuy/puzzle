import {useCallback} from "react";

type NotificationType = "success" | "error" | "info" | "warning";

interface Notification {
	id: string;
	message: string;
	type: NotificationType;
}

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

	setTimeout(() => {
		removeNotification(id);
	}, 5000);
};

const removeNotification = (id: string) => {
	notifications = notifications.filter((n) => n.id !== id);
	notify();
};

export {removeNotification};

export const useGlobalNotificationPopup = () => {
	const showSuccess = useCallback((message: string) => {
		addNotification(message, "success");
	}, []);

	const showError = useCallback((message: string) => {
		addNotification(message, "error");
	}, []);

	const showInfo = useCallback((message: string) => {
		addNotification(message, "info");
	}, []);

	const showWarning = useCallback((message: string) => {
		addNotification(message, "warning");
	}, []);

	return {
		showSuccess,
		showError,
		showInfo,
		showWarning,
	};
};

export const getNotifications = (): Notification[] => notifications;

export const subscribe = (listener: () => void) => {
	listeners = [...listeners, listener];
	return () => {
		listeners = listeners.filter((l) => l !== listener);
	};
};
