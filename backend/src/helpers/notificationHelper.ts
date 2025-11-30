import {createNotification} from "@/controllers/notificationController";

/**
 * Helper function to create notifications for various events
 */
export const createProjectNotification = async (
	userId: string,
	projectTitle: string,
	type: "created" | "updated" | "completed" | "failed",
	projectId?: string,
	projectType?: "script_generation" | "script_voice" | "full_service"
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

	let link: string | undefined;
	if (projectId && projectType) {
		const routeMap = {
			script_generation: "script-generation",
			script_voice: "script-voice",
			full_service: "full-service",
		};
		const routePrefix = routeMap[projectType];
		if (routePrefix) {
			link = `/${routePrefix}/${projectId}`;
		}
	}

	await createNotification(
		userId,
		notificationData.title,
		notificationData.message,
		notificationData.notificationType,
		link,
		{
			projectId,
			projectTitle,
			projectType,
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
