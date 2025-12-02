import express from "express";
import {
	createDeposit,
	payosWebhook,
	getTransactions,
	getBalance,
	getTransactionById,
} from "@/controllers/paymentController";
import {createDepositValidator} from "@/validators/paymentValidators";
import {validate} from "@/middlewares/validation";
import {authenticate} from "@/middlewares/auth";
import {verifyPayOSSignature} from "@/middlewares/payosAuth";

const router = express.Router();

router.post("/payos-webhook", verifyPayOSSignature, payosWebhook);

router.post(
	"/create-deposit",
	authenticate,
	validate(createDepositValidator),
	createDeposit
);
router.get("/transactions", authenticate, getTransactions);
router.get("/transactions/:id", authenticate, getTransactionById);
router.get("/balance", authenticate, getBalance);

export default router;
