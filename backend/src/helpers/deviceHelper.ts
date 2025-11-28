import {Request} from "express";

export interface DeviceInfo {
	userAgent: string;
	platform?: string;
	browser?: string;
	device?: string;
	os?: string;
}

export const parseUserAgent = (userAgent: string): DeviceInfo => {
	const info: DeviceInfo = {
		userAgent,
	};

	if (userAgent.includes("Windows")) {
		info.os = "Windows";
	} else if (userAgent.includes("Mac OS")) {
		info.os = "Mac OS";
	} else if (userAgent.includes("Linux")) {
		info.os = "Linux";
	} else if (userAgent.includes("Android")) {
		info.os = "Android";
	} else if (
		userAgent.includes("iOS") ||
		userAgent.includes("iPhone") ||
		userAgent.includes("iPad")
	) {
		info.os = "iOS";
	}

	if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
		info.browser = "Chrome";
	} else if (userAgent.includes("Firefox")) {
		info.browser = "Firefox";
	} else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
		info.browser = "Safari";
	} else if (userAgent.includes("Edg")) {
		info.browser = "Edge";
	} else if (userAgent.includes("Opera") || userAgent.includes("OPR")) {
		info.browser = "Opera";
	}

	if (userAgent.includes("Mobile")) {
		info.device = "Mobile";
	} else if (userAgent.includes("Tablet")) {
		info.device = "Tablet";
	} else {
		info.device = "Desktop";
	}

	if (userAgent.includes("Windows")) {
		info.platform = "Windows";
	} else if (userAgent.includes("Mac")) {
		info.platform = "Mac";
	} else if (userAgent.includes("Linux")) {
		info.platform = "Linux";
	} else if (userAgent.includes("Android")) {
		info.platform = "Android";
	} else if (
		userAgent.includes("iOS") ||
		userAgent.includes("iPhone") ||
		userAgent.includes("iPad")
	) {
		info.platform = "iOS";
	}

	return info;
};

export const getIpAddress = (req: Request): string => {
	const forwarded = req.headers["x-forwarded-for"];
	const ip = forwarded
		? typeof forwarded === "string"
			? forwarded.split(",")[0]
			: forwarded[0]
		: req.socket.remoteAddress || req.ip || "unknown";
	return ip.trim();
};

export const getDeviceInfo = (req: Request): DeviceInfo => {
	const userAgent = req.headers["user-agent"] || "unknown";
	return parseUserAgent(userAgent);
};
