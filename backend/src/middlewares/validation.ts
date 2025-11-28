import {Request, Response, NextFunction} from "express";
import {validationResult, ValidationChain} from "express-validator";

export const validate = (validations: ValidationChain[]) => {
	return async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		await Promise.all(validations.map((validation) => validation.run(req)));

		const errors = validationResult(req);
		if (errors.isEmpty()) {
			return next();
		}

		// Get first error message for better UX
		const firstError = errors.array()[0];
		const errorMessage = firstError?.msg || "Validation failed";

		res.status(400).json({
			success: false,
			message: errorMessage,
			errors: errors.array(),
		});
	};
};
