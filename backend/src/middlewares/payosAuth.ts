import {Request, Response, NextFunction} from "express";
import payosService from "@/services/payosService";

export const verifyPayOSSignature = (
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	try {
		const verifiedData = payosService.verifyWebhook(req.body);

		if (verifiedData && Object.keys(verifiedData).length > 0) {
			req.body = verifiedData;
		}

		next();
	} catch (error: any) {
		console.error("PayOS webhook verification failed:", error);

		res.status(200).json({
			success: false,
			message: "Invalid webhook signature",
		});
		return;
	}
};
