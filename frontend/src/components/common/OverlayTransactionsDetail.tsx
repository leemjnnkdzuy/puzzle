import React, {useState, useEffect, useCallback} from "react";
import {Check, XCircle, QrCode, Copy} from "lucide-react";
import Overlay from "@/components/ui/Overlay";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Loading from "@/components/ui/Loading";
import {useLanguage} from "@/hooks/useLanguage";
import {useGlobalNotificationPopup} from "@/hooks/useGlobalNotificationPopup";
import paymentService, {type Transaction} from "@/services/PaymentService";
import {cn} from "@/utils";

interface OverlayTransactionsDetailProps {
	isOpen: boolean;
	onClose: () => void;
	transactionId: string | null;
}

const OverlayTransactionsDetail: React.FC<OverlayTransactionsDetailProps> = ({
	isOpen,
	onClose,
	transactionId,
}) => {
	const {getNested} = useLanguage();
	const {showError} = useGlobalNotificationPopup();
	const [transaction, setTransaction] = useState<Transaction | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [copiedField, setCopiedField] = useState<string | null>(null);

	const transactionHistory = getNested?.("transactionHistory") as {
		transactionDetail?: {
			title?: string;
			transactionId?: string;
			paymentSuccessful?: string;
			paymentFailed?: string;
			accountNumber?: string;
			accountName?: string;
			transferContent?: string;
			gateway?: string;
			transactionDate?: string;
			close?: string;
			scanQRToComplete?: string;
		};
		status?: {
			pending?: string;
			paid?: string;
			completed?: string;
			failed?: string;
		};
		paymentMethod?: string;
		amount?: string;
		credit?: string;
		date?: string;
		referenceCode?: string;
		statusLabel?: string;
		errors?: {
			loadDetailFailed?: string;
		};
	};

	const recharge = getNested?.("recharge") as {
		payos?: string;
		paypal?: string;
		bitcoin?: string;
		visa?: string;
	};

	const loadTransactionDetail = useCallback(async () => {
		if (!transactionId) return;

		try {
			setLoading(true);
			const response = await paymentService.getTransactionById(
				transactionId
			);

			if (response.success && response.data) {
				setTransaction(response.data);
			} else {
				showError(
					transactionHistory?.errors?.loadDetailFailed ||
						"Failed to load transaction details"
				);
				onClose();
			}
		} catch {
			showError(
				transactionHistory?.errors?.loadDetailFailed ||
					"Failed to load transaction details"
			);
			onClose();
		} finally {
			setLoading(false);
		}
	}, [
		transactionId,
		showError,
		onClose,
		transactionHistory?.errors?.loadDetailFailed,
	]);

	useEffect(() => {
		if (isOpen && transactionId) {
			loadTransactionDetail();
		} else {
			setTransaction(null);
		}
	}, [isOpen, transactionId, loadTransactionDetail]);

	const copyToClipboard = async (text: string, field: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopiedField(field);
			setTimeout(() => setCopiedField(null), 2000);
		} catch {
			showError("Failed to copy to clipboard");
		}
	};

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("vi-VN").format(value);
	};

	const formatReferenceCode = (code: string | undefined) => {
		if (!code) return "-";
		return code.replace(/_/g, " ");
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("vi-VN", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		}).format(date);
	};

	const getPaymentMethodLabel = (method: Transaction["paymentMethod"]) => {
		switch (method) {
			case "payos":
				return recharge?.payos || "PayOS";
			case "paypal":
				return recharge?.paypal || "PayPal";
			case "bitcoin":
				return recharge?.bitcoin || "Bitcoin";
			case "visa":
				return recharge?.visa || "Visa";
			default:
				return method;
		}
	};

	if (!isOpen) return null;

	return (
		<Overlay isOpen={isOpen} onClose={onClose} contentClassName='max-w-6xl'>
			<div className='p-6'>
				<div className='mb-6'>
					<h2 className='text-2xl font-semibold'>
						{transactionHistory?.transactionDetail?.title ||
							"Transaction Details"}
					</h2>
				</div>

				{loading ? (
					<div className='flex justify-center items-center py-16'>
						<Loading size='lg' />
					</div>
				) : transaction ? (
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
						<div className='space-y-4 lg:pr-6 lg:border-r border-border'>
							<div className='bg-muted/50 rounded-lg p-4'>
								<h3 className='text-lg font-semibold mb-4'>
									{transactionHistory?.transactionDetail
										?.title || "Transaction Details"}
								</h3>

								<div className='mb-4'>
									<label className='text-sm font-medium text-muted-foreground block mb-1'>
										{transactionHistory?.transactionDetail
											?.transactionId || "Transaction ID"}
									</label>
									<p className='text-sm font-mono break-all'>
										{transaction._id}
									</p>
								</div>

								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<div>
										<label className='text-sm font-medium text-muted-foreground block mb-1'>
											{transactionHistory?.paymentMethod ||
												"Payment Method"}
										</label>
										<p className='text-sm'>
											{getPaymentMethodLabel(
												transaction.paymentMethod
											)}
										</p>
									</div>

									<div>
										<label className='text-sm font-medium text-muted-foreground block mb-1'>
											{transactionHistory?.amount ||
												"Amount"}
										</label>
										<p className='text-sm font-medium'>
											{formatCurrency(transaction.amount)}{" "}
											VND
										</p>
									</div>

									<div>
										<label className='text-sm font-medium text-muted-foreground block mb-1'>
											{transactionHistory?.credit ||
												"Credit"}
										</label>
										<p className='text-sm font-medium text-primary'>
											+
											{formatCurrency(transaction.credit)}{" "}
											{transactionHistory?.credit ||
												"Credit"}
										</p>
									</div>

									{transaction.gateway && (
										<div>
											<label className='text-sm font-medium text-muted-foreground block mb-1'>
												{transactionHistory
													?.transactionDetail
													?.gateway ||
													"Payment Gateway"}
											</label>
											<p className='text-sm'>
												{transaction.gateway}
											</p>
										</div>
									)}

									{transaction.transactionDate && (
										<div>
											<label className='text-sm font-medium text-muted-foreground block mb-1'>
												{transactionHistory
													?.transactionDetail
													?.transactionDate ||
													"Transaction Date"}
											</label>
											<p className='text-sm'>
												{formatDate(
													transaction.transactionDate
												)}
											</p>
										</div>
									)}

									<div>
										<label className='text-sm font-medium text-muted-foreground block mb-1'>
											{transactionHistory?.date ||
												"Created At"}
										</label>
										<p className='text-sm'>
											{formatDate(transaction.createdAt)}
										</p>
									</div>
								</div>

								<div className='mt-4'>
									<label className='text-sm font-medium text-muted-foreground block mb-1'>
										{transactionHistory?.statusLabel ||
											"Status"}
									</label>
									<span
										className={cn(
											"inline-block px-2 py-1 rounded-md text-xs font-medium border",
											transaction.status === "pending"
												? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
												: transaction.status === "paid"
												? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
												: transaction.status ===
												  "completed"
												? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
												: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
										)}
									>
										{transaction.status === "pending"
											? transactionHistory?.status
													?.pending || "Pending"
											: transaction.status === "paid"
											? transactionHistory?.status
													?.paid || "Paid"
											: transaction.status === "completed"
											? transactionHistory?.status
													?.completed || "Completed"
											: transactionHistory?.status
													?.failed || "Failed"}
									</span>
								</div>

								{transaction.referenceCode &&
									transaction.status !== "pending" && (
										<div className='mt-4'>
											<label className='text-sm font-medium text-muted-foreground block mb-1'>
												{transactionHistory?.referenceCode ||
													"Reference Code"}
											</label>
											<div className='flex items-center gap-2'>
												<Input
													value={formatReferenceCode(
														transaction.referenceCode
													)}
													readOnly
													className='font-mono text-sm flex-1 min-w-[400px]'
												/>
												<Button
													size='icon'
													variant='outline'
													className='h-9 min-h-[36px] w-9 flex-shrink-0'
													onClick={() =>
														copyToClipboard(
															transaction.referenceCode ||
																"",
															"referenceCode"
														)
													}
												>
													{copiedField ===
													"referenceCode" ? (
														<Check className='w-4 h-4' />
													) : (
														<Copy className='w-4 h-4' />
													)}
												</Button>
											</div>
										</div>
									)}

								{transaction.accountNumber &&
									transaction.status !== "failed" && (
										<div className='mt-4'>
											<label className='text-sm font-medium text-muted-foreground block mb-1'>
												{transactionHistory
													?.transactionDetail
													?.accountNumber ||
													"Account Number"}
											</label>
											<div className='flex items-center gap-2'>
												<Input
													value={
														transaction.accountNumber
													}
													readOnly
													className='font-mono text-sm flex-1 min-w-[400px]'
												/>
												<Button
													size='icon'
													variant='outline'
													className='h-9 min-h-[36px] w-9 flex-shrink-0'
													onClick={() =>
														copyToClipboard(
															transaction.accountNumber ||
																"",
															"accountNumber"
														)
													}
												>
													{copiedField ===
													"accountNumber" ? (
														<Check className='w-4 h-4' />
													) : (
														<Copy className='w-4 h-4' />
													)}
												</Button>
											</div>
											{transaction.accountName && (
												<p className='text-xs text-muted-foreground mt-1'>
													{transaction.accountName}
												</p>
											)}
										</div>
									)}

								{transaction.referenceCode &&
									transaction.status === "pending" && (
										<div className='mt-4'>
											<label className='text-sm font-medium text-muted-foreground block mb-1'>
												{transactionHistory
													?.transactionDetail
													?.transferContent ||
													"Transfer Content"}
											</label>
											<div className='flex items-center gap-2'>
												<Input
													value={formatReferenceCode(
														transaction.referenceCode
													)}
													readOnly
													className='font-mono text-sm flex-1 min-w-[400px]'
												/>
												<Button
													size='icon'
													variant='outline'
													className='h-9 min-h-[36px] w-9 flex-shrink-0'
													onClick={() =>
														copyToClipboard(
															transaction.referenceCode ||
																"",
															"transferContent"
														)
													}
												>
													{copiedField ===
													"transferContent" ? (
														<Check className='w-4 h-4' />
													) : (
														<Copy className='w-4 h-4' />
													)}
												</Button>
											</div>
										</div>
									)}
							</div>
						</div>

						<div className='space-y-4 flex items-center justify-center h-full'>
							{transaction.status === "completed" ? (
								<div className='flex flex-col items-center justify-center space-y-4'>
									<div className='w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center'>
										<Check className='w-10 h-10 text-green-600 dark:text-green-400' />
									</div>
									<h3 className='text-xl font-semibold text-green-600 dark:text-green-400'>
										{transactionHistory?.transactionDetail
											?.paymentSuccessful ||
											"Payment Successful"}
									</h3>
								</div>
							) : transaction.status === "failed" ? (
								<div className='flex flex-col items-center justify-center space-y-4'>
									<div className='w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center'>
										<XCircle className='w-10 h-10 text-red-600 dark:text-red-400' />
									</div>
									<h3 className='text-xl font-semibold text-red-600 dark:text-red-400'>
										{transactionHistory?.transactionDetail
											?.paymentFailed || "Payment Failed"}
									</h3>
								</div>
							) : transaction.status === "pending" &&
							  transaction.qrCodeUrl ? (
								<div className='flex flex-col items-center justify-center space-y-4'>
									<div className='w-64 h-64 bg-white rounded-lg flex items-center justify-center border-2 border-border p-4'>
										<img
											src={transaction.qrCodeUrl}
											alt='QR Code'
											className='w-full h-full object-contain'
										/>
									</div>
									<p className='text-sm text-muted-foreground text-center'>
										{transactionHistory?.transactionDetail
											?.scanQRToComplete ||
											"Quét QR để hoàn tất giao dịch"}
									</p>
								</div>
							) : (
								<div className='flex flex-col items-center justify-center space-y-4'>
									<div className='w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center'>
										<QrCode className='w-10 h-10 text-yellow-600 dark:text-yellow-400' />
									</div>
									<h3 className='text-xl font-semibold text-yellow-600 dark:text-yellow-400'>
										{transactionHistory?.status?.pending ||
											"Pending"}
									</h3>
								</div>
							)}
						</div>
					</div>
				) : null}

				<div className='mt-6 flex justify-end'>
					<Button variant='outline' onClick={onClose}>
						{transactionHistory?.transactionDetail?.close ||
							"Close"}
					</Button>
				</div>
			</div>
		</Overlay>
	);
};

export default OverlayTransactionsDetail;
