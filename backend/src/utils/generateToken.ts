import jwt from "jsonwebtoken";

export const generateAccessToken = (
	userId: string,
	sessionId?: string
): string => {
	const secret =
		process.env.JWT_ACCESS_SECRET ||
		process.env.JWT_SECRET ||
		"your-access-secret-key";
	const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
	return jwt.sign({userId, type: "access", sessionId}, secret, {
		expiresIn,
	} as any);
};

export const generateRefreshToken = (
	userId: string,
	sessionId?: string
): string => {
	const secret =
		process.env.JWT_REFRESH_SECRET ||
		process.env.JWT_SECRET ||
		"your-refresh-secret-key";
	const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
	return jwt.sign({userId, type: "refresh", sessionId}, secret, {
		expiresIn,
	} as any);
};

export const verifyAccessToken = (
	token: string
): {userId: string; type: string; sessionId?: string} => {
	const secret =
		process.env.JWT_ACCESS_SECRET ||
		process.env.JWT_SECRET ||
		"your-access-secret-key";
	return jwt.verify(token, secret) as {
		userId: string;
		type: string;
		sessionId?: string;
	};
};

export const verifyRefreshToken = (
	token: string
): {userId: string; type: string; sessionId?: string} => {
	const secret =
		process.env.JWT_REFRESH_SECRET ||
		process.env.JWT_SECRET ||
		"your-refresh-secret-key";
	return jwt.verify(token, secret) as {
		userId: string;
		type: string;
		sessionId?: string;
	};
};

export const generateVerificationCode = (): string => {
	return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateResetToken = (): string => {
	return (
		Math.random().toString(36).substring(2, 15) +
		Math.random().toString(36).substring(2, 15)
	);
};

export const generateSSEToken = (
	userId: string,
	sessionId?: string
): string => {
	const secret =
		process.env.JWT_ACCESS_SECRET ||
		process.env.JWT_SECRET ||
		"your-access-secret-key";
	const expiresIn = process.env.JWT_SSE_EXPIRES_IN || "1h";
	return jwt.sign({userId, type: "sse", sessionId}, secret, {
		expiresIn,
	} as any);
};

export const verifySSEToken = (
	token: string
): {userId: string; type: string; sessionId?: string} => {
	const secret =
		process.env.JWT_ACCESS_SECRET ||
		process.env.JWT_SECRET ||
		"your-access-secret-key";
	return jwt.verify(token, secret) as {
		userId: string;
		type: string;
		sessionId?: string;
	};
};
