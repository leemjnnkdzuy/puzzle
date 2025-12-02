import {Request, Response, NextFunction} from "express";
import User, {IUser} from "@/models/User";
import {verifyAccessToken, verifySSEToken} from "@/utils/generateToken";
import tokenBlacklist from "@/utils/tokenBlacklist";
import LoginHistory from "@/models/LoginHistory";

export interface AuthRequest extends Request {
	user?: IUser;
}

export const authenticate = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const token =
			req.cookies?.accessToken ||
			req.headers.authorization?.replace("Bearer ", "") ||
			(req.query?.token as string);

		if (!token) {
			res.status(401).json({
				success: false,
				message: "Authentication required",
			});
			return;
		}

		let decoded: {userId: string; type: string; sessionId?: string};
		let isSSEToken = false;

		if (req.query?.token) {
			try {
				decoded = verifySSEToken(token);
				if (decoded.type === "sse") {
					isSSEToken = true;
				} else {
					decoded = verifyAccessToken(token);
				}
			} catch (sseError) {
				try {
					decoded = verifyAccessToken(token);
				} catch (accessError) {
					res.status(401).json({
						success: false,
						message: "Invalid or expired token",
					});
					return;
				}
			}
		} else {
			try {
				decoded = verifyAccessToken(token);
			} catch (error) {
				res.status(401).json({
					success: false,
					message: "Invalid or expired access token",
				});
				return;
			}
		}

		if (!isSSEToken) {
			if (decoded.type !== "access") {
				res.status(401).json({
					success: false,
					message: "Invalid token type",
				});
				return;
			}

			const isTokenBlacklisted = await tokenBlacklist.isTokenBlacklisted(
				token
			);
			if (isTokenBlacklisted) {
				res.status(401).json({
					success: false,
					message: "Token has been revoked",
				});
				return;
			}
		}

		if (decoded.sessionId) {
			const isSessionBlacklisted =
				await tokenBlacklist.isSessionBlacklisted(
					decoded.sessionId,
					decoded.userId
				);
			if (isSessionBlacklisted) {
				res.status(401).json({
					success: false,
					message: "Session has been revoked",
				});
				return;
			}

			const session = await LoginHistory.findOne({
				sessionId: decoded.sessionId,
				user: decoded.userId,
			});

			if (!session || !session.isActive) {
				res.status(401).json({
					success: false,
					message: "Session is not active",
				});
				return;
			}
		}

		const user = await User.findById(decoded.userId).select("-password");

		if (!user) {
			res.status(401).json({
				success: false,
				message: "User not found",
			});
			return;
		}

		req.user = user;
		next();
	} catch (error) {
		res.status(401).json({
			success: false,
			message: "Invalid or expired token",
		});
	}
};
