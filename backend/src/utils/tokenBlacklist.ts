import {createHash} from "crypto";
import TokenBlacklistModel from "@/models/TokenBlacklist";

class TokenBlacklist {
	private hashToken(token: string): string {
		return createHash("sha256").update(token).digest("hex");
	}

	async addToken(
		token: string,
		userId: string,
		expiresInSeconds: number = 15 * 60
	): Promise<void> {
		const tokenHash = this.hashToken(token);
		const expiresAt = new Date();
		expiresAt.setSeconds(expiresAt.getSeconds() + expiresInSeconds);

		await TokenBlacklistModel.findOneAndUpdate(
			{tokenHash},
			{
				tokenHash,
				userId,
				revokedAt: new Date(),
				expiresAt,
			},
			{upsert: true, new: true}
		);
	}

	async addSession(
		sessionId: string,
		userId: string,
		expiresInSeconds: number = 7 * 24 * 60 * 60
	): Promise<void> {
		const expiresAt = new Date();
		expiresAt.setSeconds(expiresAt.getSeconds() + expiresInSeconds);

		await TokenBlacklistModel.findOneAndUpdate(
			{sessionId, userId},
			{
				sessionId,
				userId,
				revokedAt: new Date(),
				expiresAt,
			},
			{upsert: true, new: true}
		);
	}

	async isTokenBlacklisted(token: string): Promise<boolean> {
		const tokenHash = this.hashToken(token);
		const blacklisted = await TokenBlacklistModel.findOne({
			tokenHash,
			expiresAt: {$gt: new Date()},
		});
		return !!blacklisted;
	}

	async isSessionBlacklisted(
		sessionId: string,
		userId?: string
	): Promise<boolean> {
		const query: any = {
			sessionId,
			expiresAt: {$gt: new Date()},
		};
		if (userId) {
			query.userId = userId;
		}
		const blacklisted = await TokenBlacklistModel.findOne(query);
		return !!blacklisted;
	}

	async removeToken(token: string): Promise<void> {
		const tokenHash = this.hashToken(token);
		await TokenBlacklistModel.deleteOne({tokenHash});
	}

	async removeSession(sessionId: string, userId?: string): Promise<void> {
		const query: any = {sessionId};
		if (userId) {
			query.userId = userId;
		}
		await TokenBlacklistModel.deleteMany(query);
	}

	async clear(userId?: string): Promise<void> {
		if (userId) {
			await TokenBlacklistModel.deleteMany({userId});
		} else {
			await TokenBlacklistModel.deleteMany({});
		}
	}

	async cleanupExpired(): Promise<void> {
		await TokenBlacklistModel.deleteMany({
			expiresAt: {$lt: new Date()},
		});
	}
}

export default new TokenBlacklist();
