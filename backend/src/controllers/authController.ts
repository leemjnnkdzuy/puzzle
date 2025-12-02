import {Request, Response} from "express";
import User from "@/models/User";
import LoginHistory from "@/models/LoginHistory";
import {
	generateAccessToken,
	generateRefreshToken,
	generateVerificationCode,
	verifyRefreshToken,
	verifyAccessToken,
	generateSSEToken,
} from "@/utils/generateToken";
import {AuthRequest} from "@/middlewares/auth";
import {
	sendVerificationEmail,
	sendResetCodeEmail,
} from "@/helpers/sendMailHelper";
import {getDeviceInfo, getIpAddress} from "@/helpers/deviceHelper";
import defaultAvatar from "@/data/defualtAvatar.json";
import tokenBlacklist from "@/utils/tokenBlacklist";
import sseServer from "@/utils/sseServer";
import {randomUUID} from "crypto";

export const register = async (req: Request, res: Response): Promise<void> => {
	try {
		const {username, email, password, first_name, last_name} = req.body;

		const normalizedEmail = email?.toLowerCase().trim();
		const normalizedUsername = username?.toLowerCase().trim();

		const existingUser = await User.findOne({
			$or: [{email: normalizedEmail}, {username: normalizedUsername}],
		});

		if (existingUser) {
			res.status(400).json({
				success: false,
				message:
					existingUser.email === normalizedEmail
						? "Email already registered"
						: "Username already taken",
			});
			return;
		}

		const verificationCode = generateVerificationCode();
		const verificationCodeExpires = new Date();
		verificationCodeExpires.setHours(
			verificationCodeExpires.getHours() + 24
		);

		const defaultAvatarBase64 = `data:${defaultAvatar.image.mime};base64,${defaultAvatar.image.data}`;

		const user = new User({
			username: normalizedUsername,
			email: normalizedEmail,
			password,
			first_name,
			last_name,
			avatar: defaultAvatarBase64,
			verificationCode,
			verificationCodeExpires,
		});

		await user.save();

		try {
			await sendVerificationEmail(
				user.email,
				verificationCode,
				user.first_name
			);
		} catch (error) {
			// Email sending failed, but registration still succeeds
		}

		res.status(201).json({
			success: true,
			message: "Registration successful! Please verify your email.",
			data: {
				userId: user._id,
				username: user.username,
				email: user.email,
			},
		});
	} catch (error: any) {
		if (error.name === "ValidationError") {
			const errors = Object.values(error.errors).map(
				(err: any) => err.message
			);
			res.status(400).json({
				success: false,
				message: errors.join(", "),
			});
			return;
		}

		if (error.code === 11000) {
			const field = Object.keys(error.keyPattern)[0];
			res.status(400).json({
				success: false,
				message: `${field} already exists`,
			});
			return;
		}

		res.status(500).json({
			success: false,
			message: error.message || "Registration failed",
		});
	}
};

export const login = async (req: Request, res: Response): Promise<void> => {
	try {
		const {username, password} = req.body;

		if (!username || !password) {
			res.status(400).json({
				success: false,
				message: "Username and password are required",
			});
			return;
		}

		const normalizedUsername = username.trim().toLowerCase();

		const user = await User.findOne({
			$or: [{username: normalizedUsername}, {email: normalizedUsername}],
		}).select("+password");

		if (!user) {
			res.status(401).json({
				success: false,
				message: "Invalid credentials",
			});
			return;
		}

		const isPasswordValid = await user.comparePassword(password);

		if (!isPasswordValid) {
			res.status(401).json({
				success: false,
				message: "Invalid credentials",
			});
			return;
		}

		const deviceInfo = getDeviceInfo(req);
		const ipAddress = getIpAddress(req);
		const sessionId = randomUUID();

		await LoginHistory.updateMany(
			{
				user: user._id,
				isActive: true,
			},
			{
				$set: {
					isActive: false,
					logoutAt: new Date(),
				},
			}
		);

		const loginHistory = new LoginHistory({
			user: user._id,
			deviceInfo,
			ipAddress,
			loginAt: new Date(),
			isActive: true,
			sessionId,
		});

		await loginHistory.save();

		const refreshToken = generateRefreshToken(
			user._id.toString(),
			sessionId
		);

		const refreshTokenExpires = new Date();
		refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 7);

		user.refreshToken = refreshToken;
		user.refreshTokenExpires = refreshTokenExpires;
		await user.save();

		const accessToken = generateAccessToken(user._id.toString(), sessionId);

		const isProduction = process.env.NODE_ENV === "production";
		const cookieOptions = {
			httpOnly: true,
			secure: isProduction,
			sameSite: isProduction ? ("strict" as const) : ("lax" as const),
			maxAge: 7 * 24 * 60 * 60 * 1000,
		};

		res.cookie("accessToken", accessToken, {
			...cookieOptions,
			maxAge: 15 * 60 * 1000,
		});
		res.cookie("refreshToken", refreshToken, cookieOptions);

		const userObject = user.toObject();
		const {
			password: _,
			refreshToken: __,
			...userWithoutPassword
		} = userObject;

		res.status(200).json({
			success: true,
			message: "Login successful",
			data: {
				user: userWithoutPassword,
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Login failed",
		});
	}
};

export const forgotPassword = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const {email} = req.body;

		const user = await User.findOne({email: email.toLowerCase()});

		if (!user) {
			res.status(200).json({
				success: true,
				message: "If email exists, reset code has been sent",
				emailNotFound: true,
			});
			return;
		}

		const resetCode = generateVerificationCode();
		user.verificationCode = resetCode;
		user.verificationCodeExpires = new Date();
		user.verificationCodeExpires.setHours(
			user.verificationCodeExpires.getHours() + 1
		);

		await user.save();

		try {
			await sendResetCodeEmail(user.email, resetCode, user.first_name);
		} catch (error) {
			user.verificationCode = undefined;
			user.verificationCodeExpires = undefined;
			await user.save();

			res.status(500).json({
				success: false,
				message:
					"Failed to send reset code email. Please try again later.",
			});
			return;
		}

		res.status(200).json({
			success: true,
			message: "Reset code has been sent to your email",
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to send reset code",
		});
	}
};

export const refreshToken = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const token = req.cookies?.refreshToken;

		if (!token) {
			res.status(400).json({
				success: false,
				message: "Refresh token is required",
			});
			return;
		}

		let decoded: {userId: string; type: string; sessionId?: string};

		try {
			decoded = verifyRefreshToken(token);
		} catch (error) {
			res.status(401).json({
				success: false,
				message: "Invalid or expired refresh token",
			});
			return;
		}

		if (decoded.type !== "refresh") {
			res.status(401).json({
				success: false,
				message: "Invalid token type",
			});
			return;
		}

		const user = await User.findById(decoded.userId).select(
			"+refreshToken"
		);

		if (!user || user.refreshToken !== token) {
			res.status(401).json({
				success: false,
				message: "Invalid refresh token",
			});
			return;
		}

		if (user.refreshTokenExpires && user.refreshTokenExpires < new Date()) {
			user.refreshToken = undefined;
			user.refreshTokenExpires = undefined;
			await user.save();

			res.status(401).json({
				success: false,
				message: "Refresh token expired",
			});
			return;
		}

		let sessionId = decoded.sessionId;
		if (sessionId) {
			const isSessionBlacklisted =
				await tokenBlacklist.isSessionBlacklisted(
					sessionId,
					user._id.toString()
				);
			if (isSessionBlacklisted) {
				user.refreshToken = undefined;
				user.refreshTokenExpires = undefined;
				await user.save();

				res.status(401).json({
					success: false,
					message: "Session has been revoked",
				});
				return;
			}

			const session = await LoginHistory.findOne({
				sessionId,
				user: user._id,
			});
			if (!session || !session.isActive) {
				user.refreshToken = undefined;
				user.refreshTokenExpires = undefined;
				await user.save();

				res.status(401).json({
					success: false,
					message: "Session is not active",
				});
				return;
			}

			// Kiểm tra xem có session nào mới hơn không
			const latestSession = await LoginHistory.findOne({
				user: user._id,
				isActive: true,
			})
				.sort({loginAt: -1})
				.limit(1);

			if (
				latestSession &&
				latestSession.sessionId !== sessionId &&
				latestSession.loginAt > session.loginAt
			) {
				// Có session mới hơn, vô hiệu hóa session hiện tại
				session.isActive = false;
				session.logoutAt = new Date();
				await session.save();

				user.refreshToken = undefined;
				user.refreshTokenExpires = undefined;
				await user.save();

				res.status(401).json({
					success: false,
					message: "A newer session exists. Please login again.",
				});
				return;
			}
		}

		const accessToken = generateAccessToken(user._id.toString(), sessionId);

		const isProduction = process.env.NODE_ENV === "production";
		res.cookie("accessToken", accessToken, {
			httpOnly: true,
			secure: isProduction,
			sameSite: isProduction ? ("strict" as const) : ("lax" as const),
			maxAge: 15 * 60 * 1000,
		});

		res.status(200).json({
			success: true,
			message: "Token refreshed successfully",
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to refresh token",
		});
	}
};

export const logout = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const user = await User.findById(req.user?._id);

		if (user) {
			user.refreshToken = undefined;
			user.refreshTokenExpires = undefined;
			await user.save();

			await LoginHistory.findOneAndUpdate(
				{
					user: user._id,
					isActive: true,
				},
				{
					$set: {
						logoutAt: new Date(),
						isActive: false,
					},
				},
				{
					sort: {loginAt: -1},
				}
			);
		}

		res.clearCookie("accessToken");
		res.clearCookie("refreshToken");

		res.status(200).json({
			success: true,
			message: "Logout successful",
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Logout failed",
		});
	}
};

export const getCurrentUser = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const user = await User.findById(req.user?._id).select("-password");

		if (!user) {
			res.status(404).json({
				success: false,
				message: "User not found",
			});
			return;
		}

		const userObject = user.toObject();

		res.status(200).json({
			success: true,
			data: {
				user: userObject,
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to get user information",
		});
	}
};

export const getLoginHistory = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const userId = req.user?._id;
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 10;
		const skip = (page - 1) * limit;

		const loginHistory = await LoginHistory.find({user: userId})
			.sort({loginAt: -1})
			.skip(skip)
			.limit(limit)
			.select("-__v");

		const total = await LoginHistory.countDocuments({user: userId});

		res.status(200).json({
			success: true,
			data: {
				loginHistory,
				pagination: {
					page,
					limit,
					total,
					pages: Math.ceil(total / limit),
				},
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to get login history",
		});
	}
};

export const validateSession = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const userId = req.user?._id;

		if (!userId) {
			res.status(401).json({
				success: false,
				valid: false,
				message: "Unauthorized",
			});
			return;
		}

		const token =
			req.cookies?.accessToken ||
			req.headers.authorization?.replace("Bearer ", "");

		if (!token) {
			res.status(401).json({
				success: false,
				valid: false,
				message: "Token is required",
			});
			return;
		}

		let decoded: {userId: string; type: string; sessionId?: string};
		try {
			decoded = verifyAccessToken(token);
		} catch (error) {
			res.status(401).json({
				success: false,
				valid: false,
				message: "Invalid token",
			});
			return;
		}

		if (decoded.userId !== userId.toString()) {
			res.status(401).json({
				success: false,
				valid: false,
				message: "Token user mismatch",
			});
			return;
		}

		const isTokenBlacklisted = await tokenBlacklist.isTokenBlacklisted(
			token
		);
		if (isTokenBlacklisted) {
			res.status(200).json({
				success: true,
				valid: false,
				message: "Token has been revoked",
			});
			return;
		}

		if (decoded.sessionId) {
			const isSessionBlacklisted =
				await tokenBlacklist.isSessionBlacklisted(
					decoded.sessionId,
					userId.toString()
				);
			if (isSessionBlacklisted) {
				res.status(200).json({
					success: true,
					valid: false,
					message: "Session has been revoked",
				});
				return;
			}

			const session = await LoginHistory.findOne({
				sessionId: decoded.sessionId,
				user: userId,
			});

			if (!session || !session.isActive) {
				res.status(200).json({
					success: true,
					valid: false,
					message: "Session is not active",
				});
				return;
			}
		}

		res.status(200).json({
			success: true,
			valid: true,
			sessionId: decoded.sessionId,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			valid: false,
			message: "Failed to validate session",
		});
	}
};

export const getSSEToken = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const userId = req.user?._id;

		if (!userId) {
			res.status(401).json({
				success: false,
				message: "Unauthorized",
			});
			return;
		}

		// Get sessionId from current access token
		const token =
			req.cookies?.accessToken ||
			req.headers.authorization?.replace("Bearer ", "");

		let sessionId: string | undefined;
		if (token) {
			try {
				const decoded = verifyAccessToken(token);
				sessionId = decoded.sessionId;
			} catch (error) {
				// If access token is invalid, continue without sessionId
			}
		}

		// Generate SSE token
		const sseToken = generateSSEToken(userId.toString(), sessionId);

		res.status(200).json({
			success: true,
			data: {
				token: sseToken,
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to generate SSE token",
		});
	}
};

export const logoutSession = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const userId = req.user?._id;
		const {sessionId} = req.body;

		if (!userId) {
			res.status(401).json({
				success: false,
				message: "Unauthorized",
			});
			return;
		}

		if (!sessionId) {
			res.status(400).json({
				success: false,
				message: "Session ID is required",
			});
			return;
		}

		const session = await LoginHistory.findOne({
			_id: sessionId,
			user: userId,
		});

		if (!session) {
			res.status(404).json({
				success: false,
				message: "Session not found",
			});
			return;
		}

		const updatedSession = await LoginHistory.findByIdAndUpdate(
			sessionId,
			{
				$set: {
					logoutAt: new Date(),
					isActive: false,
				},
			},
			{new: true}
		);

		if (updatedSession?.sessionId) {
			await tokenBlacklist.addSession(
				updatedSession.sessionId,
				userId.toString(),
				7 * 24 * 60 * 60
			);

			const token =
				req.cookies?.accessToken ||
				req.headers.authorization?.replace("Bearer ", "");
			if (token) {
				try {
					const decoded = verifyAccessToken(token);
					if (decoded.sessionId === updatedSession.sessionId) {
						await tokenBlacklist.addToken(
							token,
							userId.toString(),
							15 * 60
						);
					}
				} catch (error) {
					console.error("Error invalidating access token:", error);
				}
			}

			const sessionUser = await User.findById(userId).select(
				"+refreshToken"
			);
			if (sessionUser?.refreshToken) {
				try {
					const decoded = verifyRefreshToken(
						sessionUser.refreshToken
					);
					if (decoded.sessionId === updatedSession.sessionId) {
						await tokenBlacklist.addToken(
							sessionUser.refreshToken,
							userId.toString(),
							7 * 24 * 60 * 60
						);
						sessionUser.refreshToken = undefined;
						sessionUser.refreshTokenExpires = undefined;
						await sessionUser.save();
					}
				} catch (error) {
					console.error("Error invalidating refresh token:", error);
				}
			}

			sseServer.sendLogoutEvent(
				userId.toString(),
				updatedSession.sessionId
			);
		}

		res.status(200).json({
			success: true,
			message: "Session logged out successfully",
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to logout session",
		});
	}
};

export const logoutAllSessions = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const userId = req.user?._id;

		if (!userId) {
			res.status(401).json({
				success: false,
				message: "Unauthorized",
			});
			return;
		}

		const activeSessions = await LoginHistory.find({
			user: userId,
			isActive: true,
		});

		await LoginHistory.updateMany(
			{
				user: userId,
				isActive: true,
			},
			{
				$set: {
					logoutAt: new Date(),
					isActive: false,
				},
			}
		);

		const token =
			req.cookies?.accessToken ||
			req.headers.authorization?.replace("Bearer ", "");
		if (token) {
			try {
				const decoded = verifyAccessToken(token);
				if (decoded.sessionId) {
					await tokenBlacklist.addToken(
						token,
						userId.toString(),
						15 * 60
					);
				}
			} catch (error) {
				console.error("Error invalidating access token:", error);
			}
		}

		for (const session of activeSessions) {
			if (session.sessionId) {
				await tokenBlacklist.addSession(
					session.sessionId,
					userId.toString(),
					7 * 24 * 60 * 60
				);
			}
		}

		const user = await User.findById(userId).select("+refreshToken");
		if (user && user.refreshToken) {
			await tokenBlacklist.addToken(
				user.refreshToken,
				userId.toString(),
				7 * 24 * 60 * 60
			);
			user.refreshToken = undefined;
			user.refreshTokenExpires = undefined;
			await user.save();
		}

		sseServer.sendLogoutEvent(userId.toString());

		res.status(200).json({
			success: true,
			message: "All sessions logged out successfully",
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to logout all sessions",
		});
	}
};

export const verify = async (req: Request, res: Response): Promise<void> => {
	try {
		const {code} = req.body;

		if (!code) {
			res.status(400).json({
				success: false,
				message: "Verification code is required",
			});
			return;
		}

		const user = await User.findOne({
			verificationCode: code,
			verificationCodeExpires: {$gt: new Date()},
		});

		if (!user) {
			res.status(400).json({
				success: false,
				message: "Invalid or expired verification code",
			});
			return;
		}

		user.isEmailVerified = true;
		user.verificationCode = undefined;
		user.verificationCodeExpires = undefined;
		await user.save();

		res.status(200).json({
			success: true,
			message: "Email verified successfully",
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Verification failed",
		});
	}
};

export const verifyResetPin = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const {email, code} = req.body;

		if (!email || !code) {
			res.status(400).json({
				success: false,
				message: "Email and verification code are required",
			});
			return;
		}

		const user = await User.findOne({
			email: email.toLowerCase(),
			verificationCode: code,
			verificationCodeExpires: {$gt: new Date()},
		});

		if (!user) {
			res.status(400).json({
				success: false,
				message: "Invalid or expired verification code",
			});
			return;
		}

		const resetToken = generateAccessToken(user._id.toString());

		user.verificationCode = undefined;
		user.verificationCodeExpires = undefined;
		await user.save();

		res.status(200).json({
			success: true,
			message: "Verification code verified successfully",
			resetToken,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Verification failed",
		});
	}
};

export const resetPassword = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const {resetToken, password} = req.body;

		if (!resetToken || !password) {
			res.status(400).json({
				success: false,
				message: "Reset token and password are required",
			});
			return;
		}

		let decoded: {userId: string; type: string};
		try {
			decoded = verifyAccessToken(resetToken);
		} catch (error) {
			res.status(400).json({
				success: false,
				message: "Invalid or expired reset token",
			});
			return;
		}

		const user = await User.findById(decoded.userId).select("+password");

		if (!user) {
			res.status(404).json({
				success: false,
				message: "User not found",
			});
			return;
		}

		user.password = password;
		await user.save();

		res.status(200).json({
			success: true,
			message: "Password reset successfully",
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Password reset failed",
		});
	}
};
