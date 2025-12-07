import apiConfig from "@/configs/AppConfig";
import apiClient from "@/utils";
import type {AxiosError} from "axios";

export interface Notification {
	id: string;
	userId: string;
	title: string;
	message: string;
	type: "info" | "success" | "warning" | "error";
	read: boolean;
	link?: string;
	metadata?: Record<string, unknown>;
	createdAt: string;
	updatedAt: string;
}

export interface NotificationsResponse {
	notifications: Notification[];
	total: number;
	unreadCount: number;
}

class NotificationService {
	private baseUrl = `${apiConfig.apiBaseUrl}/notifications`;

	async getNotifications(
		limit: number = 50,
		skip: number = 0,
		unreadOnly: boolean = false
	): Promise<NotificationsResponse> {
		try {
			const params = new URLSearchParams({
				limit: limit.toString(),
				skip: skip.toString(),
				unreadOnly: unreadOnly.toString(),
			});

			const response = await apiClient.get<{
				success: boolean;
				data: NotificationsResponse;
				message?: string;
			}>(`${this.baseUrl}?${params.toString()}`);

			return response.data.data;
		} catch (error) {
			const axiosError = error as AxiosError<{message?: string}>;
			const errorMessage =
				axiosError.response?.data?.message ||
				axiosError.message ||
				"Failed to fetch notifications";
			throw new Error(errorMessage);
		}
	}

	async getUnreadCount(): Promise<number> {
		try {
			const response = await apiClient.get<{
				success: boolean;
				data: {unreadCount: number};
				message?: string;
			}>(`${this.baseUrl}/unread-count`);

			return response.data.data.unreadCount;
		} catch (error) {
			const axiosError = error as AxiosError<{message?: string}>;
			const errorMessage =
				axiosError.response?.data?.message ||
				axiosError.message ||
				"Failed to fetch unread count";
			throw new Error(errorMessage);
		}
	}

	async markAsRead(id: string): Promise<Notification> {
		try {
			const response = await apiClient.put<{
				success: boolean;
				data: Notification;
				message?: string;
			}>(`${this.baseUrl}/${id}/read`);

			return response.data.data;
		} catch (error) {
			const axiosError = error as AxiosError<{message?: string}>;
			const errorMessage =
				axiosError.response?.data?.message ||
				axiosError.message ||
				"Failed to mark notification as read";
			throw new Error(errorMessage);
		}
	}

	async markAllAsRead(): Promise<void> {
		try {
			await apiClient.put<{
				success: boolean;
				message?: string;
			}>(`${this.baseUrl}/read-all`);
		} catch (error) {
			const axiosError = error as AxiosError<{message?: string}>;
			const errorMessage =
				axiosError.response?.data?.message ||
				axiosError.message ||
				"Failed to mark all notifications as read";
			throw new Error(errorMessage);
		}
	}

	async deleteNotification(id: string): Promise<void> {
		try {
			await apiClient.delete<{
				success: boolean;
				message?: string;
			}>(`${this.baseUrl}/${id}`);
		} catch (error) {
			const axiosError = error as AxiosError<{message?: string}>;
			const errorMessage =
				axiosError.response?.data?.message ||
				axiosError.message ||
				"Failed to delete notification";
			throw new Error(errorMessage);
		}
	}
}

export default new NotificationService();
