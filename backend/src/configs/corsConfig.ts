import {CorsOptions} from "cors";

const getAllowedOrigins = (): string[] => {
	const corsOrigin = process.env.VERCEL === "0" ? process.env.CORS_ORIGIN_DEVELOPMENT : process.env.CORS_ORIGIN_PRODUCTION;

	if (!corsOrigin) {
		return ["http://localhost:5173"];
	}

	const origins = corsOrigin.includes(",")
		? corsOrigin.split(",")
		: [corsOrigin];

	return origins.map((origin) => origin.trim().replace(/\/$/, ""));
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
	let corsOrigin = process.env.VERCEL === "0" ? process.env.CORS_ORIGIN_DEVELOPMENT : process.env.CORS_ORIGIN_PRODUCTION;
	if (!corsOrigin) {
		corsOrigin = "http://localhost:5173";
	}
	return corsOrigin;
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
