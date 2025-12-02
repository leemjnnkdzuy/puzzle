import Transaction from "@/models/Transaction";
import sseServer from "./sseServer";

export const markExpiredPendingTransactionsAsFailed =
	async (): Promise<void> => {
		try {
			const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

			const expiredTransactions = await Transaction.find({
				status: "pending",
				createdAt: {$lt: fiveMinutesAgo},
			});

			if (expiredTransactions.length === 0) {
				return;
			}

			const result = await Transaction.updateMany(
				{
					status: "pending",
					createdAt: {$lt: fiveMinutesAgo},
				},
				{
					$set: {
						status: "failed",
					},
				}
			);

			if (result.modifiedCount > 0) {
				const userIds = new Set<string>();
				expiredTransactions.forEach((transaction) => {
					const userId = transaction.userId.toString();
					if (!userIds.has(userId)) {
						userIds.add(userId);
					}
				});

				for (const transaction of expiredTransactions) {
					sseServer.sendTransactionEvent(
						transaction.userId.toString(),
						transaction._id.toString(),
						"failed"
					);
				}
			}
		} catch (error) {
			console.error(
				"Error marking expired transactions as failed:",
				error
			);
		}
	};

export const startTransactionCleanupScheduler = (): void => {
	markExpiredPendingTransactionsAsFailed();

	setInterval(() => {
		markExpiredPendingTransactionsAsFailed();
	}, 60 * 1000);
};
