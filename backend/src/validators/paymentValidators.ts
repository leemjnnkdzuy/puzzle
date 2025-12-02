import {body} from "express-validator";

export const createDepositValidator = [
	body("amount")
		.isFloat({min: 1000})
		.withMessage("Minimum amount is 1000 VND")
		.toFloat(),
	body("paymentMethod")
		.isIn(["payos", "paypal", "bitcoin", "visa"])
		.withMessage("Invalid payment method"),
];
