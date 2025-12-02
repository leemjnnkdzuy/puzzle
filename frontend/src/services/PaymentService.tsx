import apiClient from "@/utils/axiosInstance";

export interface CreateDepositRequest {
	amount: number;
	paymentMethod: "payos" | "paypal" | "bitcoin" | "visa";
}

export interface CreateDepositResponse {
	success: boolean;
	message?: string;
	data?: {
		transactionId: string;
		amount: number;
		credit: number;
		paymentMethod: string;
		referenceCode: string;
		qrCodeUrl?: string;
		paymentLink?: string;
		accountNumber?: string | null;
		accountName?: string | null;
	};
}

export interface Transaction {
	_id: string;
	userId: string;
	amount: number;
	credit: number;
	paymentMethod: "payos" | "paypal" | "bitcoin" | "visa";
	status: "pending" | "paid" | "completed" | "failed";
	referenceCode?: string;
	payosOrderCode?: number;
	payosTransactionId?: string;
	gateway?: string;
	transactionDate?: string;
	qrCodeUrl?: string;
	accountNumber?: string;
	accountName?: string;
	createdAt: string;
	updatedAt: string;
}

export interface GetTransactionsResponse {
	success: boolean;
	message?: string;
	data?: {
		transactions: Transaction[];
		pagination: {
			page: number;
			limit: number;
			total: number;
			totalPages: number;
		};
	};
}

export interface GetBalanceResponse {
	success: boolean;
	message?: string;
	data?: {
		credit: number;
	};
}

const api = apiClient;

class PaymentService {
	async createDeposit(
		data: CreateDepositRequest
	): Promise<CreateDepositResponse> {
		const response = await api.post<CreateDepositResponse>(
			"/api/payments/create-deposit",
			data
		);
		return response.data;
	}

	async getTransactions(params?: {
		page?: number;
		limit?: number;
	}): Promise<GetTransactionsResponse> {
		const queryParams = new URLSearchParams();
		if (params?.page) queryParams.append("page", params.page.toString());
		if (params?.limit) queryParams.append("limit", params.limit.toString());

		const response = await api.get<GetTransactionsResponse>(
			`/api/payments/transactions?${queryParams.toString()}`
		);
		return response.data;
	}

	async getBalance(): Promise<GetBalanceResponse> {
		const response = await api.get<GetBalanceResponse>(
			"/api/payments/balance"
		);
		return response.data;
	}

	async getTransactionById(id: string): Promise<{
		success: boolean;
		message?: string;
		data?: Transaction;
	}> {
		const response = await api.get<{
			success: boolean;
			message?: string;
			data?: Transaction;
		}>(`/api/payments/transactions/${id}`);
		return response.data;
	}
}

const paymentService = new PaymentService();

export default paymentService;
