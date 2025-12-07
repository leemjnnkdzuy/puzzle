import {CorsOptions} from "cors";

const getAllowedOrigins = (): string[] => {
	const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";

	if (corsOrigin.includes(",")) {
		return corsOrigin.split(",").map((origin) => origin.trim());
	}

	return [corsOrigin];
};

export const isOriginAllowed = (origin: string | undefined): boolean => {
	if (!origin) {
		return true;
	}

	const allowedOrigins = getAllowedOrigins();

	if (process.env.NODE_ENV === "development") {
		return true;
	}

	return allowedOrigins.includes(origin);
};

export const corsOptions: CorsOptions = {
	origin: (origin, callback) => {
		if (isOriginAllowed(origin)) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},
	credentials: true,
	methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
	allowedHeaders: [
		"Content-Type",
		"Authorization",
		"X-Requested-With",
		"Accept",
		"Origin",
		"Range",
	],
	exposedHeaders: ["Set-Cookie", "Content-Range", "Accept-Ranges"],
	optionsSuccessStatus: 200,
};

export const getCorsOrigin = (): string => {
	return process.env.CORS_ORIGIN || "http://localhost:5173";
};

export const getAllowedOriginsList = (): string[] => {
	return getAllowedOrigins();
};

export const getCookieOptions = () => {
	const isProduction = process.env.NODE_ENV === "production";
	const isVercel = process.env.VERCEL === "1";

	const sameSite =
		isVercel ||
		(isProduction && process.env.ALLOW_CROSS_ORIGIN_COOKIES === "true")
			? ("none" as const)
			: isProduction
			? ("strict" as const)
			: ("lax" as const);

	const secure = sameSite === "none" ? true : isProduction;

	return {
		httpOnly: true,
		secure,
		sameSite,
	};
};
