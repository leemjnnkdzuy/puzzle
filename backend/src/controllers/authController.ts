import {Request, Response} from "express";
import User from "@/models/User";
import {
	generateAccessToken,
	generateRefreshToken,
	generateVerificationCode,
	verifyRefreshToken,
	verifyAccessToken,
} from "@/utils/generateToken";
import {AuthRequest} from "@/middlewares/auth";
import {
	sendVerificationEmail,
	sendResetCodeEmail,
} from "@/helpers/sendMailHelper";

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

		const user = new User({
			username: normalizedUsername,
			email: normalizedEmail,
			password,
			first_name,
			last_name,
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
			console.error("Failed to send verification email:", error);
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
		console.error("Register error:", error);

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

		if (process.env.NODE_ENV === "development") {
			console.log("Login attempt for:", normalizedUsername);
		}

		const user = await User.findOne({
			$or: [{username: normalizedUsername}, {email: normalizedUsername}],
		}).select("+password");

		if (!user) {
			if (process.env.NODE_ENV === "development") {
				console.log("User not found:", normalizedUsername);
			}
			res.status(401).json({
				success: false,
				message: "Invalid credentials",
			});
			return;
		}

		const isPasswordValid = await user.comparePassword(password);

		if (!isPasswordValid) {
			if (process.env.NODE_ENV === "development") {
				console.log("Invalid password for user:", normalizedUsername);
			}
			res.status(401).json({
				success: false,
				message: "Invalid credentials",
			});
			return;
		}

		const accessToken = generateAccessToken(user._id.toString());
		const refreshToken = generateRefreshToken(user._id.toString());

		const refreshTokenExpires = new Date();
		refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 7);

		user.refreshToken = refreshToken;
		user.refreshTokenExpires = refreshTokenExpires;
		await user.save();

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
		console.error("Login error:", error);
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
			console.error("Failed to send reset code email:", error);
		}

		res.status(200).json({
			success: true,
			message: "Reset code has been sent to your email",
		});
	} catch (error) {
		console.error("Forgot password error:", error);
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

		let decoded: {userId: string; type: string};

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

		// Check if refresh token is expired
		if (user.refreshTokenExpires && user.refreshTokenExpires < new Date()) {
			// Clear expired refresh token
			user.refreshToken = undefined;
			user.refreshTokenExpires = undefined;
			await user.save();

			res.status(401).json({
				success: false,
				message: "Refresh token expired",
			});
			return;
		}

		// Generate new access token
		const accessToken = generateAccessToken(user._id.toString());

		// Set new access token cookie
		const isProduction = process.env.NODE_ENV === "production";
		res.cookie("accessToken", accessToken, {
			httpOnly: true,
			secure: isProduction,
			sameSite: isProduction ? ("strict" as const) : ("lax" as const),
			maxAge: 15 * 60 * 1000, // 15 minutes
		});

		res.status(200).json({
			success: true,
			message: "Token refreshed successfully",
		});
	} catch (error) {
		console.error("Refresh token error:", error);
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
		}

		// Clear cookies
		res.clearCookie("accessToken");
		res.clearCookie("refreshToken");

		res.status(200).json({
			success: true,
			message: "Logout successful",
		});
	} catch (error) {
		console.error("Logout error:", error);
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

		res.status(200).json({
			success: true,
			data: {
				user,
			},
		});
	} catch (error) {
		console.error("Get current user error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to get user information",
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
		console.error("Verify error:", error);
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

		// Generate reset token (JWT)
		const resetToken = generateAccessToken(user._id.toString());

		// Clear verification code
		user.verificationCode = undefined;
		user.verificationCodeExpires = undefined;
		await user.save();

		res.status(200).json({
			success: true,
			message: "Verification code verified successfully",
			resetToken,
		});
	} catch (error) {
		console.error("Verify reset pin error:", error);
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

		// Verify reset token
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

		// Update password
		user.password = password;
		await user.save();

		res.status(200).json({
			success: true,
			message: "Password reset successfully",
		});
	} catch (error) {
		console.error("Reset password error:", error);
		res.status(500).json({
			success: false,
			message: "Password reset failed",
		});
	}
};
