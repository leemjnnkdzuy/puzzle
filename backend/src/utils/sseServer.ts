import {Response} from "express";
import Notification from "@/models/Notification";

type SSEClient = {
	userId: string;
	response: Response;
};

class SSEServer {
	private clients: Map<string, SSEClient[]> = new Map();

	addClient(userId: string, res: Response): void {
		res.setHeader("Content-Type", "text/event-stream");
		res.setHeader("Cache-Control", "no-cache");
		res.setHeader("Connection", "keep-alive");
		res.setHeader("X-Accel-Buffering", "no");

		res.write(": connected\n\n");

		if (!this.clients.has(userId)) {
			this.clients.set(userId, []);
		}

		this.clients.get(userId)!.push({userId, response: res});

		res.on("close", () => {
			this.removeClient(userId, res);
		});

		const heartbeat = setInterval(() => {
			try {
				res.write(": heartbeat\n\n");
			} catch (error) {
				clearInterval(heartbeat);
				this.removeClient(userId, res);
			}
		}, 15000);

		res.on("close", () => {
			clearInterval(heartbeat);
		});
	}

	private removeClient(userId: string, res: Response): void {
		const userClients = this.clients.get(userId);
		if (userClients) {
			const index = userClients.findIndex(
				(client) => client.response === res
			);
			if (index !== -1) {
				userClients.splice(index, 1);
				if (userClients.length === 0) {
					this.clients.delete(userId);
				}
			}
		}
	}

	sendNotification(userId: string, notification: any): void {
		const userClients = this.clients.get(userId);
		if (userClients && userClients.length > 0) {
			const data = JSON.stringify({
				type: "notification",
				data: notification,
			});
			userClients.forEach((client) => {
				try {
					client.response.write(`data: ${data}\n\n`);
				} catch (error) {
					this.removeClient(userId, client.response);
				}
			});
		}
	}

	sendUnreadCount(userId: string, count: number): void {
		const userClients = this.clients.get(userId);
		if (userClients && userClients.length > 0) {
			const data = JSON.stringify({
				type: "unread-count",
				data: {count},
			});
			userClients.forEach((client) => {
				try {
					client.response.write(`data: ${data}\n\n`);
				} catch (error) {
					this.removeClient(userId, client.response);
				}
			});
		}
	}

	sendLogoutEvent(userId: string, sessionId?: string): void {
		const userClients = this.clients.get(userId);
		if (userClients && userClients.length > 0) {
			const data = JSON.stringify({
				type: "logout",
				data: {sessionId, reason: "Session revoked"},
			});
			userClients.forEach((client) => {
				try {
					client.response.write(`data: ${data}\n\n`);
				} catch (error) {
					this.removeClient(userId, client.response);
				}
			});
		}
	}

	sendTransactionEvent(
		userId: string,
		transactionId: string,
		status: "pending" | "paid" | "completed" | "failed"
	): void {
		const userClients = this.clients.get(userId);
		if (userClients && userClients.length > 0) {
			const data = JSON.stringify({
				type: "transaction",
				data: {transactionId, status},
			});
			userClients.forEach((client) => {
				try {
					client.response.write(`data: ${data}\n\n`);
				} catch (error) {
					this.removeClient(userId, client.response);
				}
			});
		}
	}

	sendBalanceEvent(userId: string, credit: number, message?: string): void {
		const userClients = this.clients.get(userId);

		if (userClients && userClients.length > 0) {
			const data = JSON.stringify({
				type: "balance",
				data: {credit, message},
			});
			userClients.forEach((client) => {
				try {
					client.response.write(`data: ${data}\n\n`);
				} catch (error) {
					this.removeClient(userId, client.response);
				}
			});
		}
	}

	sendStorageEvent(
		userId: string,
		storageInfo: {
			limit: number;
			used: number;
			available: number;
			limitFormatted: string;
			usedFormatted: string;
			availableFormatted: string;
			credit: number;
		}
	): void {
		const userClients = this.clients.get(userId);

		if (userClients && userClients.length > 0) {
			const data = JSON.stringify({
				type: "storage",
				data: storageInfo,
			});
			userClients.forEach((client) => {
				try {
					client.response.write(`data: ${data}\n\n`);
				} catch (error) {
					this.removeClient(userId, client.response);
				}
			});
		}
	}

	getClientCount(userId?: string): number {
		if (userId) {
			return this.clients.get(userId)?.length || 0;
		}
		return Array.from(this.clients.values()).reduce(
			(sum, clients) => sum + clients.length,
			0
		);
	}
}

export default new SSEServer();
