import {createNotification} from "@/controllers/notificationController";

/**
 * Helper function to create notifications for various events
 */
export const createProjectNotification = async (
	userId: string,
	projectTitle: string,
	type: "created" | "updated" | "completed" | "failed",
	projectId?: string
) => {
	const typeMap = {
		created: {
			title: "Project Created",
			message: `Project "${projectTitle}" has been created successfully.`,
			notificationType: "success" as const,
		},
		updated: {
			title: "Project Updated",
			message: `Project "${projectTitle}" has been updated.`,
			notificationType: "info" as const,
		},
		completed: {
			title: "Project Completed",
			message: `Project "${projectTitle}" has been completed.`,
			notificationType: "success" as const,
		},
		failed: {
			title: "Project Failed",
			message: `Project "${projectTitle}" has failed. Please check and try again.`,
			notificationType: "error" as const,
		},
	};

	const notificationData = typeMap[type];
	const link = projectId
		? `/projects/${projectId}`
		: undefined;

	await createNotification(
		userId,
		notificationData.title,
		notificationData.message,
		notificationData.notificationType,
		link,
		{
			projectId,
			projectTitle,
			eventType: type,
		}
	);
};

export const createSystemNotification = async (
	userId: string,
	title: string,
	message: string,
	type: "info" | "success" | "warning" | "error" = "info",
	link?: string,
	metadata?: Record<string, any>
) => {
	await createNotification(userId, title, message, type, link, metadata);
};

