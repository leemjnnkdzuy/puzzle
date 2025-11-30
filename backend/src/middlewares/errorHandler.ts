import {Request, Response, NextFunction} from "express";
import AppError from "@/utils/errors";
import mongoose from "mongoose";

export const errorHandler = (
	err: Error | AppError,
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	let statusCode = 500;
	let message = "Internal Server Error";

	if (err instanceof AppError) {
		statusCode = err.statusCode;
		message = err.message;
	} else if ((err as any).code === 11000) {
		const field = Object.keys((err as any).keyPattern || {})[0];
		statusCode = 400;
		message = `${field} already exists`;
	} else if (err instanceof mongoose.Error.ValidationError) {
		statusCode = 400;
		const errors = Object.values(err.errors).map((e) => e.message);
		message = errors.join(", ");
	} else if (err instanceof mongoose.Error.CastError) {
		statusCode = 400;
		message = `Invalid ${err.path}`;
	} else if (err instanceof Error) {
		message = err.message;
		if ((err as any).statusCode) {
			statusCode = (err as any).statusCode;
		}
	}

	console.error("Error:", err);

	res.status(statusCode).json({
		success: false,
		message,
		...(process.env.NODE_ENV === "development" && {stack: err.stack}),
	});
};

export const notFound = (req: Request, res: Response): void => {
	res.status(404).json({
		success: false,
		message: "Route not found",
	});
};
