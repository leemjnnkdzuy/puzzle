import React, {useState, useEffect, useCallback} from "react";
import {useNavigate} from "react-router-dom";
import {
	QrCode,
	Copy,
	Check,
	CircleDollarSign,
	MessageCircle,
	ArrowRight,
} from "lucide-react";
import {
	FaCcVisa,
	FaPaypal,
	FaBitcoin,
	FaFacebook,
	FaTelegram,
	FaDiscord,
} from "react-icons/fa";
import {SiZalo} from "react-icons/si";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Loading from "@/components/ui/Loading";
import {useLanguage} from "@/hooks/useLanguage";
import {useGlobalNotificationPopup} from "@/hooks/useGlobalNotificationPopup";
import {useSSE, type SSEMessage} from "@/hooks/useSSE";
import paymentService, {type Transaction} from "@/services/PaymentService";
import {cn} from "@/utils";

type PaymentMethod = "payos" | "paypal" | "bitcoin" | "visa";

const RechargePage: React.FC = () => {
	const {getNested} = useLanguage();
	const {showSuccess, showError} = useGlobalNotificationPopup();
	const {onMessage, offMessage} = useSSE();

	const recharge = getNested?.("recharge") as {
		title?: string;
		currentBalance?: string;
		credit?: string;
		amount?: string;
		amountPlaceholder?: string;
		minimumAmount?: string;
		paymentMethod?: string;
		selectPaymentMethod?: string;
		payos?: string;
		paypal?: string;
		bitcoin?: string;
		visa?: string;
		createDeposit?: string;
		creating?: string;
		payosInstructions?: {
			title?: string;
			step1?: string;
			step2?: string;
			step3?: string;
			note?: string;
			paymentSuccessful?: string;
		};
		qrCode?: string;
		accountNumber?: string;
		transferContent?: string;
		copy?: string;
		copied?: string;
		transactionHistory?: string;
		noTransactions?: string;
		viewAllTransactions?: string;
		showLess?: string;
		status?: {
			pending?: string;
			paid?: string;
			completed?: string;
			failed?: string;
		};
		exchangeRate?: string;
		comingSoon?: string;
		support?: {
			title?: string;
			description?: string;
			telegram?: string;
			discord?: string;
			facebook?: string;
			zalo?: string;
		};
		errors?: {
			amountRequired?: string;
			amountMin?: string;
			paymentMethodRequired?: string;
			createFailed?: string;
			createSuccess?: string;
			loadBalanceFailed?: string;
			loadTransactionsFailed?: string;
			transactionFailed?: string;
		};
	};

	const [amount, setAmount] = useState<string>("");
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
	const [loading, setLoading] = useState<boolean>(false);
	const [depositData, setDepositData] = useState<{
		referenceCode: string;
		amount: number;
		credit: number;
		qrCodeUrl?: string;
		paymentLink?: string;
		accountNumber?: string | null;
		accountName?: string | null;
	} | null>(null);
	const [copiedField, setCopiedField] = useState<string | null>(null);
	const [paymentSuccessful, setPaymentSuccessful] = useState<boolean>(false);
	const [currentTransactionId, setCurrentTransactionId] = useState<
		string | null
	>(null);

	useEffect(() => {
		const html = document.documentElement;
		const body = document.body;

		html.classList.add("no-scrollbar");
		body.classList.add("no-scrollbar");

		let scrollableDiv: HTMLElement | null = null;
		const findAndHideScrollbar = () => {
			const mainElement = document.querySelector("main");
			if (mainElement) {
				const childDiv = mainElement.querySelector(":scope > div");
				if (childDiv) {
					const computedStyle = window.getComputedStyle(childDiv);
					if (
						computedStyle.overflowY === "auto" ||
						computedStyle.overflowY === "scroll" ||
						childDiv.classList.contains("overflow-y-auto")
					) {
						scrollableDiv = childDiv as HTMLElement;
						scrollableDiv.classList.add("no-scrollbar");
					}
				}
			}
		};

		const rafId = requestAnimationFrame(() => {
			findAndHideScrollbar();
		});

		return () => {
			cancelAnimationFrame(rafId);
			html.classList.remove("no-scrollbar");
			body.classList.remove("no-scrollbar");

			if (scrollableDiv) {
				scrollableDiv.classList.remove("no-scrollbar");
			}
		};
	}, []);

	useEffect(() => {
		const handleSSEMessage = (message: SSEMessage) => {
			if (message.type === "transaction") {
				const {transactionId, status} = message.data;

				if (
					currentTransactionId === transactionId &&
					(status === "completed" || status === "paid")
				) {
					setPaymentSuccessful(true);
				}

				if (status === "failed") {
					showError(
						recharge?.errors?.transactionFailed ||
							"Transaction has expired and been marked as failed"
					);
				}
			}
		};

		onMessage(handleSSEMessage);

		return () => {
			offMessage(handleSSEMessage);
		};
	}, [
		showError,
		currentTransactionId,
		onMessage,
		offMessage,
		recharge?.errors?.transactionFailed,
	]);

	const handleCreateDeposit = async () => {
		if (!amount || parseFloat(amount) < 1000) {
			showError(
				recharge?.errors?.amountMin || "Minimum amount is 1,000 VND"
			);
			return;
		}

		if (!paymentMethod) {
			showError(
				recharge?.errors?.paymentMethodRequired ||
					"Please select payment method"
			);
			return;
		}

		if (paymentMethod !== "payos") {
			showError(recharge?.comingSoon || "Coming soon");
			return;
		}

		try {
			setLoading(true);
			const response = await paymentService.createDeposit({
				amount: parseFloat(amount),
				paymentMethod: paymentMethod as PaymentMethod,
			});

			if (response.success && response.data) {
				setDepositData({
					referenceCode: response.data.referenceCode,
					amount: response.data.amount,
					credit: response.data.credit,
					qrCodeUrl: response.data.qrCodeUrl,
					paymentLink: response.data.paymentLink,
					accountNumber: response.data.accountNumber,
					accountName: response.data.accountName,
				});
				setPaymentSuccessful(false);
				setCurrentTransactionId(response.data.transactionId || null);
				showSuccess(
					recharge?.errors?.createSuccess ||
						"Deposit order created successfully!"
				);
			} else {
				showError(
					recharge?.errors?.createFailed ||
						"Failed to create deposit order"
				);
			}
		} catch {
			showError(
				recharge?.errors?.createFailed ||
					"Failed to create deposit order"
			);
		} finally {
			setLoading(false);
		}
	};

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

	const formatReferenceCode = (code: string) => {
		return code.replace(/_/g, " ");
	};

	return (
		<div className='container mx-auto px-4 py-8 max-w-6xl'>
			<h1 className='text-3xl font-bold mb-8'>
				{recharge?.title || "Recharge"}
			</h1>

			<div className='space-y-6'>
				<div className='space-y-6'>
					<div>
						<div className='space-y-4'>
							<div>
								<label className='block text-sm font-medium mb-4'>
									{recharge?.amount || "Amount"} (VND)
								</label>
								<div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
									{[
										20000, 50000, 100000, 200000, 500000,
										1000000, 2000000, 5000000,
									].map((offerAmount) => {
										const creditAmount = offerAmount / 1000;
										const isPopular =
											offerAmount === 100000 ||
											offerAmount === 500000;
										const isBestValue =
											offerAmount === 2000000;

										return (
											<button
												key={offerAmount}
												type='button'
												onClick={() => {
													setAmount(
														offerAmount.toString()
													);
													setTimeout(() => {
														const paymentSection =
															document.querySelector(
																"[data-payment-section]"
															);
														if (paymentSection) {
															paymentSection.scrollIntoView(
																{
																	behavior:
																		"smooth",
																	block: "start",
																}
															);
														}
													}, 100);
												}}
												className={cn(
													"p-4 rounded-lg border transition-all text-center relative",
													amount ===
														offerAmount.toString()
														? "border-primary bg-primary/10 text-primary shadow-md scale-105"
														: "border-border hover:border-primary/50 hover:bg-accent/50"
												)}
											>
												{isPopular && (
													<span className='absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full'>
														Popular
													</span>
												)}
												{isBestValue && (
													<span className='absolute -top-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-yellow-900 dark:text-yellow-100 text-[10px] font-semibold px-2 py-0.5 rounded-full'>
														Best Value
													</span>
												)}
												<div className='flex items-center justify-center mb-2'>
													<CircleDollarSign className='w-5 h-5 text-primary' />
												</div>
												<p className='text-xl font-bold mb-1'>
													{formatCurrency(
														offerAmount
													)}
												</p>
												<p className='text-xs text-muted-foreground mb-2'>
													VND
												</p>
												<div className='border-t border-border pt-2 mt-2'>
													<p className='text-sm font-semibold text-primary'>
														{formatCurrency(
															creditAmount
														)}
													</p>
													<p className='text-[10px] text-muted-foreground'>
														{recharge?.credit ||
															"Credit"}
													</p>
												</div>
											</button>
										);
									})}
								</div>
							</div>

							<div data-payment-section>
								<label className='block text-sm font-medium mb-2'>
									{recharge?.paymentMethod ||
										"Payment Method"}
								</label>
								<div className='grid grid-cols-2 gap-3'>
									<button
										type='button'
										onClick={() =>
											setPaymentMethod("payos")
										}
										className={cn(
											"p-4 border rounded-lg transition-all text-left",
											paymentMethod === "payos"
												? "border-primary bg-primary/5"
												: "border-border hover:border-primary/50"
										)}
									>
										<div className='flex items-center gap-2 mb-1'>
											<QrCode className='w-5 h-5' />
											<span className='font-medium'>
												{recharge?.payos || "PayOS"}
											</span>
										</div>
										<p className='text-xs text-muted-foreground'>
											VietQR, Bank Transfer
										</p>
									</button>

									<button
										type='button'
										onClick={() => {
											setPaymentMethod("paypal");
											showError(
												recharge?.comingSoon ||
													"Coming soon"
											);
										}}
										className={cn(
											"p-4 border rounded-lg transition-all text-left opacity-50 cursor-not-allowed"
										)}
										disabled
									>
										<div className='flex items-center gap-2 mb-1'>
											<FaPaypal className='w-5 h-5 text-[#0070ba]' />
											<span className='font-medium'>
												{recharge?.paypal || "PayPal"}
											</span>
										</div>
										<p className='text-xs text-muted-foreground'>
											{recharge?.comingSoon ||
												"Coming soon"}
										</p>
									</button>

									<button
										type='button'
										onClick={() => {
											setPaymentMethod("bitcoin");
											showError(
												recharge?.comingSoon ||
													"Coming soon"
											);
										}}
										className={cn(
											"p-4 border rounded-lg transition-all text-left opacity-50 cursor-not-allowed"
										)}
										disabled
									>
										<div className='flex items-center gap-2 mb-1'>
											<FaBitcoin className='w-5 h-5 text-[#f7931a]' />
											<span className='font-medium'>
												{recharge?.bitcoin || "Bitcoin"}
											</span>
										</div>
										<p className='text-xs text-muted-foreground'>
											{recharge?.comingSoon ||
												"Coming soon"}
										</p>
									</button>

									<button
										type='button'
										onClick={() => {
											setPaymentMethod("visa");
											showError(
												recharge?.comingSoon ||
													"Coming soon"
											);
										}}
										className={cn(
											"p-4 border rounded-lg transition-all text-left opacity-50 cursor-not-allowed"
										)}
										disabled
									>
										<div className='flex items-center gap-2 mb-1'>
											<FaCcVisa className='w-5 h-5 text-[#1a1f71]' />
											<span className='font-medium'>
												{recharge?.visa || "Visa"}
											</span>
										</div>
										<p className='text-xs text-muted-foreground'>
											{recharge?.comingSoon ||
												"Coming soon"}
										</p>
									</button>
								</div>
							</div>

							<Button
								onClick={handleCreateDeposit}
								disabled={loading || !amount || !paymentMethod}
								loading={loading}
								className='w-full'
								variant='primary-gradient'
							>
								{loading
									? recharge?.creating || "Creating..."
									: recharge?.createDeposit ||
									  "Create Deposit Order"}
							</Button>
						</div>
					</div>

					{depositData && paymentMethod === "payos" && (
						<div className='bg-card border border-border rounded-lg p-6'>
							{paymentSuccessful ? (
								<div className='flex flex-col items-center justify-center py-8 space-y-4'>
									<div className='w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center'>
										<Check className='w-8 h-8 text-green-600 dark:text-green-400' />
									</div>
									<h3 className='text-xl font-semibold text-green-600 dark:text-green-400'>
										{recharge?.payosInstructions
											?.paymentSuccessful ||
											"Thanh toán thành công"}
									</h3>
								</div>
							) : (
								<>
									<h3 className='text-lg font-semibold mb-4'>
										{recharge?.payosInstructions?.title ||
											"SePay Payment Instructions"}
									</h3>

									<div className='space-y-4'>
										<div className='flex justify-center'>
											{depositData.qrCodeUrl ? (
												<div className='w-64 h-64 bg-white rounded-lg flex items-center justify-center border-2 border-border p-4'>
													<img
														src={
															depositData.qrCodeUrl
														}
														alt='QR Code'
														className='w-full h-full object-contain'
													/>
												</div>
											) : (
												<div className='w-64 h-64 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border'>
													<div className='text-center'>
														<QrCode className='w-16 h-16 mx-auto mb-2 text-muted-foreground' />
														<p className='text-sm text-muted-foreground'>
															{recharge?.qrCode ||
																"QR Code"}
														</p>
														<p className='text-xs text-muted-foreground mt-1'>
															(QR Code not
															available)
														</p>
													</div>
												</div>
											)}
										</div>

										<div className='space-y-2 text-sm'>
											<p>
												<span className='font-medium'>
													1.
												</span>{" "}
												{recharge?.payosInstructions
													?.step1 ||
													"Scan the QR code or transfer to account number"}
											</p>
											<p>
												<span className='font-medium'>
													2.
												</span>{" "}
												{recharge?.payosInstructions
													?.step2 ||
													"Enter transfer content exactly as shown"}
											</p>
											<p>
												<span className='font-medium'>
													3.
												</span>{" "}
												{recharge?.payosInstructions
													?.step3 ||
													"Credit will be added automatically within 10 seconds"}
											</p>
										</div>

										<div className='bg-muted/50 rounded-lg p-4 space-y-3'>
											{depositData.accountNumber && (
												<div>
													<label className='text-sm font-medium mb-1 block'>
														{recharge?.accountNumber ||
															"Account Number"}
													</label>
													<div className='flex items-center gap-2'>
														<Input
															value={
																depositData.accountNumber
															}
															readOnly
															className='font-mono flex-1 min-w-[300px]'
														/>
														<Button
															size='icon'
															variant='outline'
															className='h-9 w-9'
															onClick={() =>
																copyToClipboard(
																	depositData.accountNumber ||
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
													{copiedField ===
														"accountNumber" && (
														<p className='text-xs text-green-600 dark:text-green-400 mt-1'>
															{recharge?.copied ||
																"Copied!"}
														</p>
													)}
													{depositData.accountName && (
														<p className='text-xs text-muted-foreground mt-1'>
															{
																depositData.accountName
															}
														</p>
													)}
												</div>
											)}
											<div>
												<label className='text-sm font-medium mb-1 block'>
													{recharge?.transferContent ||
														"Transfer Content"}
												</label>
												<div className='flex items-center gap-2'>
													<Input
														value={formatReferenceCode(
															depositData.referenceCode
														)}
														readOnly
														className='font-mono flex-1 min-w-[300px]'
													/>
													<Button
														size='icon'
														variant='outline'
														className='h-9 w-9'
														onClick={() =>
															copyToClipboard(
																depositData.referenceCode,
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
												{copiedField ===
													"referenceCode" && (
													<p className='text-xs text-green-600 dark:text-green-400 mt-1'>
														{recharge?.copied ||
															"Copied!"}
													</p>
												)}
											</div>

											<div className='text-xs text-muted-foreground'>
												<p>
													<strong>Amount:</strong>{" "}
													{formatCurrency(
														depositData.amount
													)}{" "}
													VND
												</p>
												<p>
													<strong>Credit:</strong>{" "}
													{formatCurrency(
														depositData.credit
													)}{" "}
													{recharge?.credit ||
														"Credit"}
												</p>
											</div>
										</div>

										<div className='bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3'>
											<p className='text-xs text-yellow-600 dark:text-yellow-400'>
												<strong>Note:</strong>{" "}
												{recharge?.payosInstructions
													?.note ||
													"Please transfer the exact amount and use the correct transfer content for automatic credit addition"}
											</p>
										</div>
									</div>
								</>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export const RechargePageRightSidebar = () => {
	const {getNested} = useLanguage();
	const navigate = useNavigate();
	const {onMessage, offMessage} = useSSE();
	const {showError} = useGlobalNotificationPopup();

	const recharge = getNested?.("recharge") as {
		currentBalance?: string;
		credit?: string;
		transactionHistory?: string;
		noTransactions?: string;
		viewAllTransactions?: string;
		showLess?: string;
		status?: {
			pending?: string;
			paid?: string;
			completed?: string;
			failed?: string;
		};
		support?: {
			title?: string;
			description?: string;
			telegram?: string;
			discord?: string;
			facebook?: string;
			zalo?: string;
		};
		errors?: {
			loadBalanceFailed?: string;
			loadTransactionsFailed?: string;
		};
	};

	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [loadingTransactions, setLoadingTransactions] =
		useState<boolean>(true);
	const [showAllTransactions, setShowAllTransactions] =
		useState<boolean>(false);

	const loadTransactions = useCallback(async () => {
		try {
			setLoadingTransactions(true);
			const response = await paymentService.getTransactions({
				page: 1,
				limit: 10,
			});
			if (response.success && response.data) {
				setTransactions(response.data.transactions);
			} else {
				showError(
					recharge?.errors?.loadTransactionsFailed ||
						"Failed to load transactions"
				);
			}
		} catch {
			showError(
				recharge?.errors?.loadTransactionsFailed ||
					"Failed to load transactions"
			);
		} finally {
			setLoadingTransactions(false);
		}
	}, [showError, recharge?.errors?.loadTransactionsFailed]);

	useEffect(() => {
		loadTransactions();
	}, [loadTransactions]);

	useEffect(() => {
		const handleSSEMessage = (message: SSEMessage) => {
			if (message.type === "transaction") {
				const {transactionId, status} = message.data;

				setTransactions((prev) =>
					prev.map((transaction) =>
						transaction._id === transactionId
							? {...transaction, status}
							: transaction
					)
				);
			}
		};

		onMessage(handleSSEMessage);

		return () => {
			offMessage(handleSSEMessage);
		};
	}, [onMessage, offMessage]);

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("vi-VN").format(value);
	};

	const getStatusBadge = (status: Transaction["status"]) => {
		const statusText =
			status === "pending"
				? recharge?.status?.pending || "Pending"
				: status === "paid"
				? recharge?.status?.paid || "Paid"
				: status === "completed"
				? recharge?.status?.completed || "Completed"
				: recharge?.status?.failed || "Failed";

		const statusColor =
			status === "pending"
				? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
				: status === "paid"
				? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
				: status === "completed"
				? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
				: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";

		return (
			<span
				className={cn(
					"px-2 py-1 rounded-md text-xs font-medium border",
					statusColor
				)}
			>
				{statusText}
			</span>
		);
	};

	return (
		<div className='space-y-6'>
			<div>
				<div className='flex items-center gap-2 mb-4'>
					<h2 className='text-lg font-semibold'>
						{recharge?.transactionHistory || "Transaction History"}
					</h2>
				</div>

				{loadingTransactions ? (
					<div className='flex justify-center py-8'>
						<Loading size='sm' />
					</div>
				) : transactions.length === 0 ? (
					<div className='text-center py-8'>
						<p className='text-sm text-muted-foreground mb-4'>
							{recharge?.noTransactions || "No transactions yet"}
						</p>
						<Button
							variant='outline'
							size='sm'
							onClick={() => navigate("/transaction-history")}
						>
							{recharge?.transactionHistory ||
								"Transaction History"}
						</Button>
					</div>
				) : (
					<>
						<div className='space-y-3 relative'>
							{(showAllTransactions
								? transactions
								: transactions.slice(0, 3)
							).map((transaction, index) => {
								const isLastOfThree =
									!showAllTransactions &&
									index === 2 &&
									transactions.length > 3;
								return (
									<div
										key={transaction._id}
										className={cn(
											"border border-border rounded-lg p-3 space-y-2 relative transition-colors hover:bg-muted/30 cursor-pointer",
											isLastOfThree && "opacity-50"
										)}
										onClick={() =>
											navigate("/transaction-history")
										}
									>
										{isLastOfThree && (
											<div className='absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent pointer-events-none rounded-lg' />
										)}
										<div className='flex items-center justify-between'>
											<span className='text-sm font-medium'>
												{formatCurrency(
													transaction.amount
												)}{" "}
												VND
											</span>
											{getStatusBadge(transaction.status)}
										</div>
										<div className='flex items-center justify-between text-xs text-muted-foreground'>
											<span>
												+
												{formatCurrency(
													transaction.credit
												)}{" "}
												{recharge?.credit || "Credit"}
											</span>
											<span>
												{new Intl.DateTimeFormat(
													"vi-VN",
													{
														year: "numeric",
														month: "2-digit",
														day: "2-digit",
														hour: "2-digit",
														minute: "2-digit",
													}
												).format(
													new Date(
														transaction.createdAt
													)
												)}
											</span>
										</div>
									</div>
								);
							})}
						</div>
						{transactions.length > 0 && (
							<Button
								variant='outline'
								size='sm'
								className='w-full mt-4 group'
								onClick={() => navigate("/transaction-history")}
							>
								{recharge?.viewAllTransactions ||
									"View All Transactions"}
								<ArrowRight className='w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1' />
							</Button>
						)}
						{showAllTransactions && transactions.length > 3 && (
							<Button
								variant='outline'
								size='sm'
								className='w-full mt-4'
								onClick={() => setShowAllTransactions(false)}
							>
								{recharge?.showLess || "Show Less"}
							</Button>
						)}
					</>
				)}
			</div>

			<div>
				<div className='flex items-center gap-2 mb-2'>
					<MessageCircle className='w-5 h-5 text-primary' />
					<h3 className='text-sm font-semibold'>
						{recharge?.support?.title || "Need Help?"}
					</h3>
				</div>
				<p className='text-xs text-muted-foreground mb-4'>
					{recharge?.support?.description ||
						"Contact us if you encounter payment issues"}
				</p>
				<div className='grid grid-cols-2 gap-2'>
					{recharge?.support?.telegram ? (
						<a
							href={recharge.support.telegram}
							target='_blank'
							rel='noopener noreferrer'
							className='flex items-center gap-2 text-sm text-muted-foreground hover:text-[#0088cc] transition-colors group'
						>
							<FaTelegram className='w-4 h-4' />
							<span>Telegram</span>
						</a>
					) : (
						<div className='flex items-center gap-2 text-sm text-muted-foreground opacity-50'>
							<FaTelegram className='w-4 h-4' />
							<span>Telegram</span>
						</div>
					)}
					{recharge?.support?.discord ? (
						<a
							href={recharge.support.discord}
							target='_blank'
							rel='noopener noreferrer'
							className='flex items-center gap-2 text-sm text-muted-foreground hover:text-[#5865F2] transition-colors group'
						>
							<FaDiscord className='w-4 h-4' />
							<span>Discord</span>
						</a>
					) : (
						<div className='flex items-center gap-2 text-sm text-muted-foreground opacity-50'>
							<FaDiscord className='w-4 h-4' />
							<span>Discord</span>
						</div>
					)}
					{recharge?.support?.facebook ? (
						<a
							href={recharge.support.facebook}
							target='_blank'
							rel='noopener noreferrer'
							className='flex items-center gap-2 text-sm text-muted-foreground hover:text-[#1877F2] transition-colors group'
						>
							<FaFacebook className='w-4 h-4' />
							<span>Facebook</span>
						</a>
					) : (
						<div className='flex items-center gap-2 text-sm text-muted-foreground opacity-50'>
							<FaFacebook className='w-4 h-4' />
							<span>Facebook</span>
						</div>
					)}
					{recharge?.support?.zalo ? (
						<a
							href={recharge.support.zalo}
							target='_blank'
							rel='noopener noreferrer'
							className='flex items-center gap-2 text-sm text-muted-foreground hover:text-[#0068FF] transition-colors group'
						>
							<SiZalo className='w-4 h-4' />
							<span>Zalo</span>
						</a>
					) : (
						<div className='flex items-center gap-2 text-sm text-muted-foreground opacity-50'>
							<SiZalo className='w-4 h-4' />
							<span>Zalo</span>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default RechargePage;
