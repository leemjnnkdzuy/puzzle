import {Request, Response, NextFunction} from "express";

export const verifySePayApiKey = (
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	const apiKey = process.env.SEPAY_API_KEY;

	if (!apiKey) {
		res.status(500).json({
			success: false,
			message: "SePay API Key not configured",
		});
		return;
	}

	const authHeader =
		req.headers["authorization"] || req.headers["Authorization"];
	let providedKey: string | undefined;

	if (authHeader) {
		const authHeaderStr = Array.isArray(authHeader)
			? authHeader[0]
			: authHeader;
		const bearerMatch = authHeaderStr.match(/^Bearer\s+(.+)$/i);
		if (bearerMatch) {
			providedKey = bearerMatch[1].trim();
		}
	}

	if (!providedKey) {
		providedKey =
			req.headers["x-sepay-api-key"] ||
			req.headers["x-sepay-apikey"] ||
			req.headers["sepay-api-key"] ||
			req.query.api_key ||
			req.query.apikey ||
			req.body?.apiKey ||
			req.body?.api_key;
	}

	const skipAuth = process.env.SEPAY_SKIP_WEBHOOK_AUTH === "true";

	if (!providedKey) {
		if (skipAuth) {
			next();
			return;
		}
		res.status(401).json({
			success: false,
			message: "SePay API Key is required",
		});
		return;
	}

	if (providedKey !== apiKey) {
		res.status(401).json({
			success: false,
			message: "Invalid SePay API Key",
		});
		return;
	}

	next();
};
