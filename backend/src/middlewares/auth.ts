import {Request, Response, NextFunction} from "express";
import User, {IUser} from "@/models/User";
import {verifyAccessToken} from "@/utils/generateToken";

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
			req.headers.authorization?.replace("Bearer ", "");

		if (!token) {
			res.status(401).json({
				success: false,
				message: "Authentication required",
			});
			return;
		}

		let decoded: {userId: string; type: string};
		try {
			decoded = verifyAccessToken(token);
		} catch (error) {
			res.status(401).json({
				success: false,
				message: "Invalid or expired access token",
			});
			return;
		}

		if (decoded.type !== "access") {
			res.status(401).json({
				success: false,
				message: "Invalid token type",
			});
			return;
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
