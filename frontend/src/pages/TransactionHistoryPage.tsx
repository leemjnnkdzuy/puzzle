import React, {useState, useEffect, useCallback} from "react";
import {
	Search,
	ChevronLeft,
	ChevronRight,
	ChevronDown,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Loading from "@/components/ui/Loading";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/DropdownMenu";
import {useLanguage} from "@/hooks/useLanguage";
import {useGlobalNotificationPopup} from "@/hooks/useGlobalNotificationPopup";
import {useSSE, type SSEMessage} from "@/hooks/useSSE";
import paymentService, {type Transaction} from "@/services/PaymentService";
import OverlayTransactionsDetail from "@/components/common/OverlayTransactionsDetail";
import {cn} from "@/utils";

const TransactionHistoryPage: React.FC = () => {
	const {getNested} = useLanguage();
	const {showError} = useGlobalNotificationPopup();
	const {onMessage, offMessage} = useSSE();

	const transactionHistory = getNested?.("transactionHistory") as {
		title?: string;
		noTransactions?: string;
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
		filterByStatus?: string;
		filterByPaymentMethod?: string;
		allStatuses?: string;
		allPaymentMethods?: string;
		search?: string;
		searchPlaceholder?: string;
		page?: string;
		of?: string;
		previous?: string;
		next?: string;
		loading?: string;
		errors?: {
			loadFailed?: string;
		};
	};

	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [page, setPage] = useState<number>(1);
	const [totalPages, setTotalPages] = useState<number>(1);
	const [total, setTotal] = useState<number>(0);
	const [statusFilter, setStatusFilter] = useState<
		"all" | "pending" | "paid" | "completed" | "failed"
	>("all");
	const [paymentMethodFilter, setPaymentMethodFilter] = useState<
		"all" | "payos" | "paypal" | "bitcoin" | "visa"
	>("all");
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [selectedTransactionId, setSelectedTransactionId] = useState<
		string | null
	>(null);
	const [isOverlayOpen, setIsOverlayOpen] = useState<boolean>(false);

	const limit = 20;

	const loadTransactions = useCallback(async () => {
		try {
			setLoading(true);
			const response = await paymentService.getTransactions({
				page,
				limit,
			});

			if (response.success && response.data) {
				let filteredTransactions = response.data.transactions;

				if (statusFilter !== "all") {
					filteredTransactions = filteredTransactions.filter(
						(t) => t.status === statusFilter
					);
				}

				if (paymentMethodFilter !== "all") {
					filteredTransactions = filteredTransactions.filter(
						(t) => t.paymentMethod === paymentMethodFilter
					);
				}

				if (searchQuery.trim()) {
					const normalizedQuery = searchQuery
						.toLowerCase()
						.replace(/\s+/g, "_");
					filteredTransactions = filteredTransactions.filter((t) =>
						t.referenceCode?.toLowerCase().includes(normalizedQuery)
					);
				}

				setTransactions(filteredTransactions);
				setTotalPages(response.data.pagination.totalPages);
				setTotal(response.data.pagination.total);
			} else {
				showError(
					transactionHistory?.errors?.loadFailed ||
						"Failed to load transactions"
				);
			}
		} catch {
			showError(
				transactionHistory?.errors?.loadFailed ||
					"Failed to load transactions"
			);
		} finally {
			setLoading(false);
		}
	}, [
		page,
		statusFilter,
		paymentMethodFilter,
		searchQuery,
		showError,
		transactionHistory?.errors?.loadFailed,
	]);

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

				if (status === "failed") {
					loadTransactions();
				}
			}
		};

		onMessage(handleSSEMessage);

		return () => {
			offMessage(handleSSEMessage);
		};
	}, [loadTransactions, onMessage, offMessage]);

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
		}).format(date);
	};

	const getStatusBadge = (status: Transaction["status"]) => {
		const statusText =
			status === "pending"
				? transactionHistory?.status?.pending || "Pending"
				: status === "paid"
				? transactionHistory?.status?.paid || "Paid"
				: status === "completed"
				? transactionHistory?.status?.completed || "Completed"
				: transactionHistory?.status?.failed || "Failed";

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

	const getPaymentMethodLabel = (method: Transaction["paymentMethod"]) => {
		const recharge = getNested?.("recharge") as {
			payos?: string;
			paypal?: string;
			bitcoin?: string;
			visa?: string;
		};

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

	const handlePageChange = (newPage: number) => {
		if (newPage >= 1 && newPage <= totalPages) {
			setPage(newPage);
			window.scrollTo({top: 0, behavior: "smooth"});
		}
	};

	const handleFilterChange = () => {
		setPage(1);
	};

	useEffect(() => {
		handleFilterChange();
	}, [statusFilter, paymentMethodFilter, searchQuery]);

	return (
		<div className='container mx-auto px-4 py-8 max-w-6xl'>
			<div className='flex items-center gap-2 mb-8'>
				<h1 className='text-3xl font-bold'>
					{transactionHistory?.title || "Transaction History"}
				</h1>
			</div>

			<div className='mb-6'>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
					<div>
						<label className='block text-sm font-medium mb-2'>
							{transactionHistory?.search || "Search"}
						</label>
						<div className='relative'>
							<Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
							<Input
								type='text'
								placeholder={
									transactionHistory?.searchPlaceholder ||
									"Search by reference code..."
								}
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className='pl-10'
								showClearIcon
								onClear={() => setSearchQuery("")}
							/>
						</div>
					</div>

					<div>
						<label className='block text-sm font-medium mb-2'>
							{transactionHistory?.statusLabel || "Status"}
						</label>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button className='w-full h-9 rounded-md border border-input bg-accent/50 px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex items-center justify-between hover:bg-accent'>
									<span>
										{statusFilter === "all"
											? transactionHistory?.allStatuses ||
											  "All Statuses"
											: statusFilter === "pending"
											? transactionHistory?.status
													?.pending || "Pending"
											: statusFilter === "paid"
											? transactionHistory?.status
													?.paid || "Paid"
											: statusFilter === "completed"
											? transactionHistory?.status
													?.completed || "Completed"
											: transactionHistory?.status
													?.failed || "Failed"}
									</span>
									<ChevronDown className='w-4 h-4 opacity-50' />
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align='start'
								className='w-[var(--radix-dropdown-menu-trigger-width)]'
							>
								<DropdownMenuItem
									onClick={() => setStatusFilter("all")}
									className={cn(
										statusFilter === "all" &&
											"bg-accent font-medium"
									)}
								>
									{transactionHistory?.allStatuses ||
										"All Statuses"}
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => setStatusFilter("pending")}
									className={cn(
										statusFilter === "pending" &&
											"bg-accent font-medium"
									)}
								>
									{transactionHistory?.status?.pending ||
										"Pending"}
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => setStatusFilter("paid")}
									className={cn(
										statusFilter === "paid" &&
											"bg-accent font-medium"
									)}
								>
									{transactionHistory?.status?.paid || "Paid"}
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => setStatusFilter("completed")}
									className={cn(
										statusFilter === "completed" &&
											"bg-accent font-medium"
									)}
								>
									{transactionHistory?.status?.completed ||
										"Completed"}
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => setStatusFilter("failed")}
									className={cn(
										statusFilter === "failed" &&
											"bg-accent font-medium"
									)}
								>
									{transactionHistory?.status?.failed ||
										"Failed"}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>

					<div>
						<label className='block text-sm font-medium mb-2'>
							{transactionHistory?.paymentMethod ||
								"Payment Method"}
						</label>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button className='w-full h-9 rounded-md border border-input bg-accent/50 px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex items-center justify-between hover:bg-accent'>
									<span>
										{paymentMethodFilter === "all"
											? transactionHistory?.allPaymentMethods ||
											  "All Payment Methods"
											: getPaymentMethodLabel(
													paymentMethodFilter as
														| "payos"
														| "paypal"
														| "bitcoin"
														| "visa"
											  )}
									</span>
									<ChevronDown className='w-4 h-4 opacity-50' />
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align='start'
								className='w-[var(--radix-dropdown-menu-trigger-width)]'
							>
								<DropdownMenuItem
									onClick={() =>
										setPaymentMethodFilter("all")
									}
									className={cn(
										paymentMethodFilter === "all" &&
											"bg-accent font-medium"
									)}
								>
									{transactionHistory?.allPaymentMethods ||
										"All Payment Methods"}
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() =>
										setPaymentMethodFilter("payos")
									}
									className={cn(
										paymentMethodFilter === "payos" &&
											"bg-accent font-medium"
									)}
								>
									{getPaymentMethodLabel("payos")}
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() =>
										setPaymentMethodFilter("paypal")
									}
									className={cn(
										paymentMethodFilter === "paypal" &&
											"bg-accent font-medium"
									)}
								>
									{getPaymentMethodLabel("paypal")}
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() =>
										setPaymentMethodFilter("bitcoin")
									}
									className={cn(
										paymentMethodFilter === "bitcoin" &&
											"bg-accent font-medium"
									)}
								>
									{getPaymentMethodLabel("bitcoin")}
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() =>
										setPaymentMethodFilter("visa")
									}
									className={cn(
										paymentMethodFilter === "visa" &&
											"bg-accent font-medium"
									)}
								>
									{getPaymentMethodLabel("visa")}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</div>

			<div className='bg-card border border-border rounded-lg overflow-hidden'>
				{loading ? (
					<div className='flex justify-center items-center py-16'>
						<Loading size='lg' />
					</div>
				) : transactions.length === 0 ? (
					<div className='text-center py-16'>
						<p className='text-muted-foreground'>
							{transactionHistory?.noTransactions ||
								"No transactions found"}
						</p>
					</div>
				) : (
					<>
						<div className='hidden md:block overflow-x-auto'>
							<table className='w-full'>
								<thead className='bg-muted/50 border-b border-border'>
									<tr>
										<th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
											{transactionHistory?.date || "Date"}
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
											{transactionHistory?.referenceCode ||
												"Reference Code"}
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
											{transactionHistory?.paymentMethod ||
												"Payment Method"}
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
											{transactionHistory?.amount ||
												"Amount"}
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
											{transactionHistory?.credit ||
												"Credit"}
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
											{transactionHistory?.statusLabel ||
												"Status"}
										</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-border'>
									{transactions.map((transaction) => (
										<tr
											key={transaction._id}
											className='hover:bg-muted/30 transition-colors'
										>
											<td className='px-6 py-4 whitespace-nowrap text-sm'>
												{formatDate(
													transaction.createdAt
												)}
											</td>
											<td className='px-6 py-4 whitespace-nowrap text-sm font-mono'>
												<button
													onClick={() => {
														setSelectedTransactionId(
															transaction._id
														);
														setIsOverlayOpen(true);
													}}
													className='hover:text-primary transition-colors cursor-pointer'
													title='Click to view details'
												>
													{formatReferenceCode(
														transaction.referenceCode
													)}
												</button>
											</td>
											<td className='px-6 py-4 whitespace-nowrap text-sm'>
												{getPaymentMethodLabel(
													transaction.paymentMethod
												)}
											</td>
											<td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
												{formatCurrency(
													transaction.amount
												)}{" "}
												VND
											</td>
											<td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-primary'>
												+
												{formatCurrency(
													transaction.credit
												)}{" "}
												{transactionHistory?.credit ||
													"Credit"}
											</td>
											<td className='px-6 py-4 whitespace-nowrap'>
												{getStatusBadge(
													transaction.status
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						<div className='md:hidden divide-y divide-border'>
							{transactions.map((transaction) => (
								<div
									key={transaction._id}
									className='p-4 space-y-3'
								>
									<div className='flex items-center justify-between'>
										<span className='text-sm font-medium'>
											{formatCurrency(transaction.amount)}{" "}
											VND
										</span>
										{getStatusBadge(transaction.status)}
									</div>
									<div className='space-y-2 text-sm'>
										<div className='flex justify-between'>
											<span className='text-muted-foreground'>
												{transactionHistory?.date ||
													"Date"}
												:
											</span>
											<span>
												{formatDate(
													transaction.createdAt
												)}
											</span>
										</div>
										<div className='flex justify-between'>
											<span className='text-muted-foreground'>
												{transactionHistory?.referenceCode ||
													"Reference Code"}
												:
											</span>
											<button
												onClick={() => {
													setSelectedTransactionId(
														transaction._id
													);
													setIsOverlayOpen(true);
												}}
												className='font-mono text-xs hover:text-primary transition-colors cursor-pointer text-left'
												title='Click to view details'
											>
												{formatReferenceCode(
													transaction.referenceCode
												)}
											</button>
										</div>
										<div className='flex justify-between'>
											<span className='text-muted-foreground'>
												{transactionHistory?.paymentMethod ||
													"Payment Method"}
												:
											</span>
											<span>
												{getPaymentMethodLabel(
													transaction.paymentMethod
												)}
											</span>
										</div>
										<div className='flex justify-between'>
											<span className='text-muted-foreground'>
												{transactionHistory?.credit ||
													"Credit"}
												:
											</span>
											<span className='font-medium text-primary'>
												+
												{formatCurrency(
													transaction.credit
												)}
											</span>
										</div>
									</div>
								</div>
							))}
						</div>

						{totalPages > 1 && (
							<div className='border-t border-border px-6 py-4 flex items-center justify-between'>
								<div className='text-sm text-muted-foreground'>
									{transactionHistory?.page || "Page"} {page}{" "}
									{transactionHistory?.of || "of"}{" "}
									{totalPages} ({total}{" "}
									{transactionHistory?.noTransactions?.toLowerCase() ||
										"transactions"}
									)
								</div>
								<div className='flex items-center gap-2'>
									<Button
										variant='outline'
										size='sm'
										onClick={() =>
											handlePageChange(page - 1)
										}
										disabled={page === 1}
									>
										<ChevronLeft className='w-4 h-4' />
										<span className='hidden sm:inline'>
											{transactionHistory?.previous ||
												"Previous"}
										</span>
									</Button>
									<Button
										variant='outline'
										size='sm'
										onClick={() =>
											handlePageChange(page + 1)
										}
										disabled={page === totalPages}
									>
										<span className='hidden sm:inline'>
											{transactionHistory?.next || "Next"}
										</span>
										<ChevronRight className='w-4 h-4' />
									</Button>
								</div>
							</div>
						)}
					</>
				)}
			</div>

			<OverlayTransactionsDetail
				isOpen={isOverlayOpen}
				onClose={() => {
					setIsOverlayOpen(false);
					setSelectedTransactionId(null);
				}}
				transactionId={selectedTransactionId}
			/>
		</div>
	);
};

export default TransactionHistoryPage;
