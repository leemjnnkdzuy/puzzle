import {Response, NextFunction, Request} from "express";
import mongoose from "mongoose";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import {AuthRequest} from "@/middlewares/auth";
import AppError from "@/utils/errors";
import {createNotification} from "@/controllers/notificationController";
import sseServer from "@/utils/sseServer";
import payosService from "@/services/payosService";

const CREDIT_EXCHANGE_RATE = 1000;

export const createDeposit = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?._id;
		const {amount, paymentMethod} = req.body;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		if (!amount || amount < 1000) {
			throw new AppError("Minimum amount is 1000 VND", 400);
		}

		if (!["payos", "paypal", "bitcoin", "visa"].includes(paymentMethod)) {
			throw new AppError("Invalid payment method", 400);
		}

		const credit = Math.floor(amount / CREDIT_EXCHANGE_RATE);

		const transaction = new Transaction({
			userId,
			amount,
			credit,
			paymentMethod,
			status: "pending",
		});

		await transaction.save();

		const transactionId = transaction._id.toString();
		const referenceCode = transactionId;

		transaction.referenceCode = referenceCode;
		await transaction.save();

		let qrCodeUrl: string | null = null;
		let paymentLink: string | null = null;
		let accountNumber: string | null = null;
		let accountName: string | null = null;

		if (paymentMethod === "payos") {
			try {
				const orderCode = parseInt(
					`${Date.now()}${Math.floor(Math.random() * 1000)}`
						.slice(-10)
						.padStart(10, "0")
				);
				const returnUrl =
					process.env.PAYOS_RETURN_URL ||
					`${
						process.env.FRONTEND_URL || "http://localhost:3000"
					}/recharge?success=true`;
				const cancelUrl =
					process.env.PAYOS_CANCEL_URL ||
					`${
						process.env.FRONTEND_URL || "http://localhost:3000"
					}/recharge?canceled=true`;

				const description = transactionId.slice(0, 25);

				const expiredAt = Math.floor(Date.now() / 1000) + 5 * 60;

				const payosResponse = await payosService.createPaymentLink({
					orderCode,
					amount,
					description,
					returnUrl,
					cancelUrl,
					expiredAt,
				});

				paymentLink = payosResponse.checkoutUrl;
				transaction.payosOrderCode = payosResponse.orderCode;

				accountNumber = payosResponse.accountNumber || null;
				accountName = payosResponse.accountName || null;

				qrCodeUrl = payosService.generateQRCode({
					amount: payosResponse.amount || amount,
					description: payosResponse.description || transactionId,
					bin: payosResponse.bin,
					accountNumber: payosResponse.accountNumber,
					accountName: payosResponse.accountName,
				});

				if (!qrCodeUrl) {
					if (payosResponse.qrCode) {
						qrCodeUrl = payosResponse.qrCode;
					}
				}

				transaction.qrCodeUrl = qrCodeUrl || undefined;
				transaction.accountNumber = accountNumber || undefined;
				transaction.accountName = accountName || undefined;
				await transaction.save();
			} catch (error) {
				console.error("PayOS create payment link error:", error);
			}
		}

		res.status(200).json({
			success: true,
			message: "Deposit order created successfully",
			data: {
				transactionId: transaction._id,
				amount,
				credit,
				paymentMethod,
				referenceCode,
				qrCodeUrl,
				paymentLink,
				accountNumber,
				accountName,
			},
		});
	} catch (error) {
		next(error);
	}
};

export const payosWebhook = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const webhookData = req.body;

		const transactionData = webhookData.data || webhookData;
		const rootCode = webhookData.code;
		const rootDesc = webhookData.desc;

		const {
			orderCode: rawOrderCode,
			amount: transferAmount,
			description: referenceCode,
			accountNumber,
			transactionDateTime,
			paymentLinkId,
			reference,
			code: dataCode,
			desc: dataDesc,
		} = transactionData;

		const code = dataCode || rootCode;
		const desc = dataDesc || rootDesc;

		const orderCode =
			typeof rawOrderCode === "string"
				? parseInt(rawOrderCode, 10)
				: rawOrderCode;

		if (!orderCode || !transferAmount) {
			res.status(200).json({
				success: false,
				message: "Invalid webhook payload: missing orderCode or amount",
			});
			return;
		}

		if (code !== "00") {
			res.status(200).json({
				success: true,
				message: "Transaction not successful",
			});
			return;
		}

		const existingTransaction = await Transaction.findOne({
			payosOrderCode: orderCode,
		});

		if (existingTransaction) {
			if (existingTransaction.status === "completed") {
				res.status(200).json({
					success: true,
					message: "Transaction already processed",
				});
				return;
			}
		}

		let pendingTransaction = await Transaction.findOne({
			payosOrderCode: orderCode,
			status: "pending",
			paymentMethod: "payos",
		});

		if (!pendingTransaction) {
			res.status(200).json({
				success: false,
				message: "Transaction not found",
			});
			return;
		}

		const amountDifference = Math.abs(
			transferAmount - pendingTransaction.amount
		);
		if (amountDifference > 1) {
			res.status(200).json({
				success: false,
				message: `Amount mismatch: Expected ${pendingTransaction.amount} VND, but received ${transferAmount} VND`,
			});
			return;
		}

		const user = await User.findById(pendingTransaction.userId);
		if (!user) {
			res.status(200).json({
				success: false,
				message: "User not found",
			});
			return;
		}

		const credit = Math.floor(
			pendingTransaction.amount / CREDIT_EXCHANGE_RATE
		);

		let parsedTransactionDate: Date;
		if (transactionDateTime) {
			if (typeof transactionDateTime === "string") {
				parsedTransactionDate = new Date(transactionDateTime);
				if (isNaN(parsedTransactionDate.getTime())) {
					parsedTransactionDate = new Date();
				}
			} else if (transactionDateTime instanceof Date) {
				parsedTransactionDate = transactionDateTime;
			} else {
				parsedTransactionDate = new Date();
			}
		} else {
			parsedTransactionDate = new Date();
		}

		pendingTransaction.status = "completed";
		pendingTransaction.payosOrderCode = orderCode;
		pendingTransaction.payosTransactionId = reference;
		pendingTransaction.transactionDate = parsedTransactionDate;
		pendingTransaction.gateway = "PayOS";
		pendingTransaction.metadata = {
			accountNumber,
			paymentLinkId,
			desc,
			referenceCode: referenceCode || pendingTransaction.referenceCode,
		};

		await pendingTransaction.save();

		const oldCredit = user.credit || 0;
		user.credit = oldCredit + credit;
		await user.save();

		sseServer.sendTransactionEvent(
			pendingTransaction.userId.toString(),
			pendingTransaction._id.toString(),
			"completed"
		);

		const formattedAmount = new Intl.NumberFormat("vi-VN").format(
			pendingTransaction.amount
		);
		const formattedCredit = new Intl.NumberFormat("vi-VN").format(credit);
		const balanceMessage = `Your deposit of ${formattedAmount} VND has been processed successfully. ${formattedCredit} credits have been added to your account.`;

		sseServer.sendBalanceEvent(
			pendingTransaction.userId.toString(),
			user.credit,
			balanceMessage
		);

		await createNotification(
			pendingTransaction.userId.toString(),
			"Payment Successful",
			`Your deposit of ${formattedAmount} VND has been processed successfully. ${formattedCredit} credits have been added to your account.`,
			"success",
			"/recharge",
			{
				transactionId: pendingTransaction._id.toString(),
				amount: pendingTransaction.amount,
				credit: credit,
				type: "payment_success",
			}
		);

		res.status(200).json({
			success: true,
		});
	} catch (error: any) {
		console.error("PayOS webhook error:", error);

		res.status(200).json({
			success: false,
			message: error?.message || "Webhook processed with errors",
		});
	}
};

export const getTransactions = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?._id;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 20;
		const skip = (page - 1) * limit;

		const transactions = await Transaction.find({userId})
			.sort({createdAt: -1})
			.skip(skip)
			.limit(limit)
			.select("-metadata");

		const total = await Transaction.countDocuments({userId});

		res.status(200).json({
			success: true,
			data: {
				transactions,
				pagination: {
					page,
					limit,
					total,
					totalPages: Math.ceil(total / limit),
				},
			},
		});
	} catch (error) {
		next(error);
	}
};

export const getBalance = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?._id;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		const user = await User.findById(userId).select("credit");

		if (!user) {
			throw new AppError("User not found", 404);
		}

		res.status(200).json({
			success: true,
			data: {
				credit: user.credit || 0,
			},
		});
	} catch (error) {
		next(error);
	}
};

export const getTransactionById = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const userId = req.user?._id;
		const {id} = req.params;

		if (!userId) {
			throw new AppError("Unauthorized", 401);
		}

		if (!id) {
			throw new AppError("Transaction ID is required", 400);
		}

		const transaction = await Transaction.findOne({
			_id: id,
			userId,
		});

		if (!transaction) {
			throw new AppError("Transaction not found", 404);
		}

		res.status(200).json({
			success: true,
			data: transaction,
		});
	} catch (error) {
		next(error);
	}
};
