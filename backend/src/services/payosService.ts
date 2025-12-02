import {PayOS} from "@payos/node";

interface CreatePaymentLinkRequest {
	orderCode: number;
	amount: number;
	description: string;
	returnUrl: string;
	cancelUrl: string;
	expiredAt?: number;
	items?: Array<{
		name: string;
		quantity: number;
		price: number;
	}>;
}

class PayOSService {
	private payOS: PayOS;

	constructor() {
		const clientId = process.env.PAYOS_CLIENT_ID;
		const apiKey = process.env.PAYOS_API_KEY;
		const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

		if (!clientId || !apiKey || !checksumKey) {
			throw new Error(
				"PayOS credentials not configured. Please set PAYOS_CLIENT_ID, PAYOS_API_KEY, and PAYOS_CHECKSUM_KEY in .env"
			);
		}

		this.payOS = new PayOS({
			clientId,
			apiKey,
			checksumKey,
		});
	}

	async createPaymentLink(request: CreatePaymentLinkRequest): Promise<{
		checkoutUrl: string;
		qrCode: string;
		orderCode: number;
		accountNumber?: string;
		accountName?: string;
		bin?: string;
		amount?: number;
		description?: string;
	}> {
		const paymentData: any = {
			orderCode: request.orderCode,
			amount: request.amount,
			description: request.description.trim(),
			items: request.items || [
				{
					name: "Nạp tiền",
					quantity: 1,
					price: request.amount,
				},
			],
			cancelUrl: request.cancelUrl,
			returnUrl: request.returnUrl,
		};

		if (request.expiredAt) {
			paymentData.expiredAt = request.expiredAt;
		}

		const paymentLinkRes = await this.payOS.paymentRequests.create(
			paymentData
		);

		const {
			bin,
			checkoutUrl,
			accountNumber,
			accountName,
			amount: responseAmount,
			description: responseDescription,
			orderCode: responseOrderCode,
			qrCode,
		} = paymentLinkRes as any;

		return {
			checkoutUrl: checkoutUrl || paymentLinkRes.checkoutUrl,
			qrCode: qrCode || paymentLinkRes.qrCode || "",
			orderCode: responseOrderCode || paymentLinkRes.orderCode,
			accountNumber:
				accountNumber || process.env.VIETQR_ACCOUNT_NUMBER || undefined,
			accountName:
				accountName || process.env.VIETQR_ACCOUNT_NAME || undefined,
			bin: bin || undefined,
			amount: responseAmount || request.amount,
			description: responseDescription || request.description,
		};
	}

	verifyWebhook(webhookData: any): any {
		return this.payOS.webhooks.verify(webhookData);
	}

	generateQRCode(data: {
		amount: number;
		description: string;
		bin?: string;
		accountNumber?: string;
		accountName?: string;
	}): string {
		try {
			const BANK_ID = data.bin || process.env.VIETQR_BANK_ID || "";
			const ACCOUNT_NUMBER =
				data.accountNumber || process.env.VIETQR_ACCOUNT_NUMBER || "";
			const TEMPLATE = process.env.VIETQR_TEMPLATE || "qr_only";
			const ACCOUNT_NAME =
				data.accountName || process.env.VIETQR_ACCOUNT_NAME || "";

			if (!BANK_ID || !ACCOUNT_NUMBER) {
				return "";
			}

			const cleanDescription = data.description.trim();
			const description = encodeURIComponent(cleanDescription);
			const encodedAccountName = encodeURIComponent(ACCOUNT_NAME);

			const vietQRUrl =
				`https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NUMBER}-${TEMPLATE}.png?` +
				`amount=${data.amount}&` +
				`addInfo=${description}&` +
				`accountName=${encodedAccountName}`;

			return vietQRUrl;
		} catch (error) {
			console.error("Error generating VietQR URL:", error);
			return "";
		}
	}
}

export default new PayOSService();
