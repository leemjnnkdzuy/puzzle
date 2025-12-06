import React, {useState, useEffect, useCallback, useMemo} from "react";
import {
	Search,
	ChevronLeft,
	ChevronRight,
	ChevronDown,
	LogOut,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Loading from "@/components/ui/Loading";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/DropdownMenu";
import {useLanguage} from "@/hooks/useLanguage";
import {useGlobalNotificationPopup} from "@/hooks/useGlobalNotificationPopup";
import authService from "@/services/AuthService";
import {cn} from "@/utils";

type LoginHistoryItem = {
	_id: string;
	deviceInfo: {
		userAgent: string;
		platform?: string;
		browser?: string;
		device?: string;
		os?: string;
	};
	ipAddress: string;
	location?: {
		country?: string;
		city?: string;
	};
	loginAt: string;
	logoutAt?: string;
	isActive: boolean;
	sessionId?: string;
};

const LoginHistoryPage: React.FC = () => {
	const {getNested} = useLanguage();
	const {showError, showSuccess} = useGlobalNotificationPopup();

	const loginHistoryPage = getNested?.("loginHistoryPage") as {
		title?: string;
		noLoginHistory?: string;
		status?: {
			all?: string;
			active?: string;
			loggedOut?: string;
		};
		device?: string;
		browser?: string;
		ipAddress?: string;
		location?: string;
		loginDate?: string;
		logoutDate?: string;
		statusLabel?: string;
		filterByStatus?: string;
		filterByDevice?: string;
		allStatuses?: string;
		allDevices?: string;
		search?: string;
		searchPlaceholder?: string;
		page?: string;
		of?: string;
		previous?: string;
		next?: string;
		loading?: string;
		logoutAll?: string;
		logout?: string;
		currentDevice?: string;
		active?: string;
		loggedOut?: string;
		unknownBrowser?: string;
		errors?: {
			loadFailed?: string;
		};
	};

	const settings = getNested?.("settings") as {
		logoutAll?: string;
		logoutAllConfirm?: string;
		logoutAllSuccess?: string;
		logoutAllFailed?: string;
		logoutSessionSuccess?: string;
		logoutSessionFailed?: string;
		cancel?: string;
	};

	const [loginHistory, setLoginHistory] = useState<LoginHistoryItem[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [page, setPage] = useState<number>(1);
	const [totalPages, setTotalPages] = useState<number>(1);
	const [total, setTotal] = useState<number>(0);
	const [statusFilter, setStatusFilter] = useState<
		"all" | "active" | "loggedOut"
	>("all");
	const [deviceFilter, setDeviceFilter] = useState<
		"all" | "chrome" | "firefox" | "safari" | "edge" | "other"
	>("all");
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [showLogoutAllDialog, setShowLogoutAllDialog] =
		useState<boolean>(false);

	const limit = 20;

	const currentDevice = useMemo(() => {
		if (loginHistory.length === 0) return null;

		const currentUserAgent =
			typeof navigator !== "undefined" ? navigator.userAgent : "";

		if (!currentUserAgent) return null;

		const matchedDevices = loginHistory.filter((history) => {
			return history.deviceInfo.userAgent === currentUserAgent;
		});

		if (matchedDevices.length === 0) return null;

		const sorted = matchedDevices.sort((a, b) => {
			if (a.isActive && !b.isActive) return -1;
			if (!a.isActive && b.isActive) return 1;
			if (!a.logoutAt && b.logoutAt) return -1;
			if (a.logoutAt && !b.logoutAt) return 1;
			return (
				new Date(b.loginAt).getTime() - new Date(a.loginAt).getTime()
			);
		});

		return sorted[0];
	}, [loginHistory]);

	const loadLoginHistory = useCallback(async () => {
		try {
			setLoading(true);
			const response = await authService.getLoginHistory({
				page,
				limit,
			});

			if (response.success && response.data) {
				let filteredHistory = response.data.loginHistory;

				if (statusFilter !== "all") {
					if (statusFilter === "active") {
						filteredHistory = filteredHistory.filter(
							(h) => h.isActive
						);
					} else if (statusFilter === "loggedOut") {
						filteredHistory = filteredHistory.filter(
							(h) => !h.isActive && h.logoutAt
						);
					}
				}

				if (deviceFilter !== "all") {
					filteredHistory = filteredHistory.filter((h) => {
						const browser = (
							h.deviceInfo.browser || ""
						).toLowerCase();
						switch (deviceFilter) {
							case "chrome":
								return browser.includes("chrome");
							case "firefox":
								return browser.includes("firefox");
							case "safari":
								return browser.includes("safari");
							case "edge":
								return browser.includes("edge");
							case "other":
								return (
									!browser.includes("chrome") &&
									!browser.includes("firefox") &&
									!browser.includes("safari") &&
									!browser.includes("edge")
								);
							default:
								return true;
						}
					});
				}

				if (searchQuery.trim()) {
					const query = searchQuery.toLowerCase();
					filteredHistory = filteredHistory.filter((h) => {
						return (
							h.ipAddress.toLowerCase().includes(query) ||
							h.deviceInfo.browser
								?.toLowerCase()
								.includes(query) ||
							h.deviceInfo.os?.toLowerCase().includes(query) ||
							h.deviceInfo.device
								?.toLowerCase()
								.includes(query) ||
							h.location?.city?.toLowerCase().includes(query) ||
							h.location?.country?.toLowerCase().includes(query)
						);
					});
				}

				setLoginHistory(filteredHistory);
				setTotalPages(response.data.pagination.pages);
				setTotal(response.data.pagination.total);
			} else {
				showError(
					loginHistoryPage?.errors?.loadFailed ||
						"Failed to load login history"
				);
			}
		} catch {
			showError(
				loginHistoryPage?.errors?.loadFailed ||
					"Failed to load login history"
			);
		} finally {
			setLoading(false);
		}
	}, [
		page,
		statusFilter,
		deviceFilter,
		searchQuery,
		showError,
		loginHistoryPage?.errors?.loadFailed,
	]);

	useEffect(() => {
		loadLoginHistory();
	}, [loadLoginHistory]);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(date);
	};

	const getStatusBadge = (history: LoginHistoryItem) => {
		if (currentDevice && currentDevice._id === history._id) {
			return (
				<span className='px-2 py-1 rounded-md text-xs font-medium border bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-500/20'>
					{loginHistoryPage?.currentDevice || "Current Device"}
				</span>
			);
		}
		if (history.isActive) {
			return (
				<span className='px-2 py-1 rounded-md text-xs font-medium border bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-500/20'>
					{loginHistoryPage?.active || "Active"}
				</span>
			);
		}
		return (
			<span className='px-2 py-1 rounded-md text-xs font-medium border bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-500/20'>
				{loginHistoryPage?.loggedOut || "Logged out"}
			</span>
		);
	};

	const getBrowserLabel = (browser: string | undefined) => {
		if (!browser) return loginHistoryPage?.unknownBrowser || "Unknown";
		const lowerBrowser = browser.toLowerCase();
		if (lowerBrowser.includes("chrome")) return "Chrome";
		if (lowerBrowser.includes("firefox")) return "Firefox";
		if (lowerBrowser.includes("safari")) return "Safari";
		if (lowerBrowser.includes("edge")) return "Edge";
		return browser;
	};

	const handleLogoutSession = async (sessionId: string) => {
		try {
			const result = await authService.logoutSession(sessionId);
			if (result.success) {
				showSuccess(
					settings?.logoutSessionSuccess ||
						"Session logged out successfully"
				);
				loadLoginHistory();
			} else {
				showError(
					result.message ||
						settings?.logoutSessionFailed ||
						"Failed to logout session"
				);
			}
		} catch (error) {
			showError(
				error instanceof Error
					? error.message
					: settings?.logoutSessionFailed ||
							"Failed to logout session"
			);
		}
	};

	const handleLogoutAll = async () => {
		try {
			const result = await authService.logoutAllSessions();
			if (result.success) {
				showSuccess(
					settings?.logoutAllSuccess ||
						"All sessions logged out successfully"
				);
				setShowLogoutAllDialog(false);
				loadLoginHistory();
			} else {
				showError(
					result.message ||
						settings?.logoutAllFailed ||
						"Failed to logout all sessions"
				);
			}
		} catch (error) {
			showError(
				error instanceof Error
					? error.message
					: settings?.logoutAllFailed ||
							"Failed to logout all sessions"
			);
		}
	};

	const handlePageChange = (newPage: number) => {
		if (newPage >= 1 && newPage <= totalPages) {
			setPage(newPage);
			window.scrollTo({top: 0, behavior: "smooth"});
		}
	};

	useEffect(() => {
		setPage(1);
	}, [statusFilter, deviceFilter, searchQuery]);

	return (
		<div className='container mx-auto px-4 py-8 max-w-6xl'>
			<div className='flex items-center justify-between mb-8'>
				<h1 className='text-3xl font-bold'>
					{loginHistoryPage?.title || "Login History"}
				</h1>
				<Button
					variant='outline'
					size='sm'
					onClick={() => setShowLogoutAllDialog(true)}
					className='flex items-center gap-2'
				>
					<LogOut className='w-4 h-4' />
					{loginHistoryPage?.logoutAll ||
						settings?.logoutAll ||
						"Logout All"}
				</Button>
			</div>

			<div className='mb-6'>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
					<div>
						<label className='block text-sm font-medium mb-2'>
							{loginHistoryPage?.search || "Search"}
						</label>
						<div className='relative'>
							<Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
							<Input
								type='text'
								placeholder={
									loginHistoryPage?.searchPlaceholder ||
									"Search by IP, device, location..."
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
							{loginHistoryPage?.statusLabel || "Status"}
						</label>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button className='w-full h-9 rounded-md border border-input bg-accent/50 px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex items-center justify-between hover:bg-accent'>
									<span>
										{statusFilter === "all"
											? loginHistoryPage?.allStatuses ||
											  "All Statuses"
											: statusFilter === "active"
											? loginHistoryPage?.status
													?.active || "Active"
											: loginHistoryPage?.status
													?.loggedOut || "Logged Out"}
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
									{loginHistoryPage?.allStatuses ||
										"All Statuses"}
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => setStatusFilter("active")}
									className={cn(
										statusFilter === "active" &&
											"bg-accent font-medium"
									)}
								>
									{loginHistoryPage?.status?.active ||
										"Active"}
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => setStatusFilter("loggedOut")}
									className={cn(
										statusFilter === "loggedOut" &&
											"bg-accent font-medium"
									)}
								>
									{loginHistoryPage?.status?.loggedOut ||
										"Logged Out"}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>

					<div>
						<label className='block text-sm font-medium mb-2'>
							{loginHistoryPage?.filterByDevice || "Device"}
						</label>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button className='w-full h-9 rounded-md border border-input bg-accent/50 px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex items-center justify-between hover:bg-accent'>
									<span>
										{deviceFilter === "all"
											? loginHistoryPage?.allDevices ||
											  "All Devices"
											: deviceFilter === "chrome"
											? "Chrome"
											: deviceFilter === "firefox"
											? "Firefox"
											: deviceFilter === "safari"
											? "Safari"
											: deviceFilter === "edge"
											? "Edge"
											: "Other"}
									</span>
									<ChevronDown className='w-4 h-4 opacity-50' />
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align='start'
								className='w-[var(--radix-dropdown-menu-trigger-width)]'
							>
								<DropdownMenuItem
									onClick={() => setDeviceFilter("all")}
									className={cn(
										deviceFilter === "all" &&
											"bg-accent font-medium"
									)}
								>
									{loginHistoryPage?.allDevices ||
										"All Devices"}
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => setDeviceFilter("chrome")}
									className={cn(
										deviceFilter === "chrome" &&
											"bg-accent font-medium"
									)}
								>
									Chrome
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => setDeviceFilter("firefox")}
									className={cn(
										deviceFilter === "firefox" &&
											"bg-accent font-medium"
									)}
								>
									Firefox
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => setDeviceFilter("safari")}
									className={cn(
										deviceFilter === "safari" &&
											"bg-accent font-medium"
									)}
								>
									Safari
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => setDeviceFilter("edge")}
									className={cn(
										deviceFilter === "edge" &&
											"bg-accent font-medium"
									)}
								>
									Edge
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => setDeviceFilter("other")}
									className={cn(
										deviceFilter === "other" &&
											"bg-accent font-medium"
									)}
								>
									Other
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
				) : loginHistory.length === 0 ? (
					<div className='text-center py-16'>
						<p className='text-muted-foreground'>
							{loginHistoryPage?.noLoginHistory ||
								"No login history found"}
						</p>
					</div>
				) : (
					<>
						<div className='hidden md:block overflow-x-auto'>
							<table className='w-full'>
								<thead className='bg-muted/50 border-b border-border'>
									<tr>
										<th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
											{loginHistoryPage?.browser ||
												"Browser"}
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
											{loginHistoryPage?.device ||
												"Device"}
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
											{loginHistoryPage?.ipAddress ||
												"IP Address"}
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
											{loginHistoryPage?.location ||
												"Location"}
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
											{loginHistoryPage?.loginDate ||
												"Login Date"}
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
											{loginHistoryPage?.statusLabel ||
												"Status"}
										</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-border'>
									{loginHistory.map((history) => (
										<tr
											key={history._id}
											className='hover:bg-muted/30 transition-colors'
										>
											<td className='px-6 py-4 whitespace-nowrap text-sm'>
												{getBrowserLabel(
													history.deviceInfo.browser
												)}
											</td>
											<td className='px-6 py-4 whitespace-nowrap text-sm'>
												{history.deviceInfo.os || "-"}
												{history.deviceInfo.device &&
													` • ${history.deviceInfo.device}`}
											</td>
											<td className='px-6 py-4 whitespace-nowrap text-sm font-mono'>
												{history.ipAddress}
											</td>
											<td className='px-6 py-4 whitespace-nowrap text-sm'>
												{history.location?.city &&
												history.location?.country
													? `${history.location.city}, ${history.location.country}`
													: "-"}
											</td>
											<td className='px-6 py-4 whitespace-nowrap text-sm'>
												{formatDate(history.loginAt)}
												{history.logoutAt && (
													<div className='text-xs text-muted-foreground mt-1'>
														{loginHistoryPage?.logoutDate ||
															"Logged out"}
														:{" "}
														{formatDate(
															history.logoutAt
														)}
													</div>
												)}
											</td>
											<td className='px-6 py-4 whitespace-nowrap'>
												{getStatusBadge(history)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						<div className='md:hidden divide-y divide-border'>
							{loginHistory.map((history) => (
								<div
									key={history._id}
									className='p-4 space-y-3'
								>
									<div className='flex items-center justify-between'>
										<span className='text-sm font-medium'>
											{getBrowserLabel(
												history.deviceInfo.browser
											)}
										</span>
										{getStatusBadge(history)}
									</div>
									<div className='space-y-2 text-sm'>
										<div className='flex justify-between'>
											<span className='text-muted-foreground'>
												{loginHistoryPage?.device ||
													"Device"}
												:
											</span>
											<span>
												{history.deviceInfo.os || "-"}
												{history.deviceInfo.device &&
													` • ${history.deviceInfo.device}`}
											</span>
										</div>
										<div className='flex justify-between'>
											<span className='text-muted-foreground'>
												{loginHistoryPage?.ipAddress ||
													"IP Address"}
												:
											</span>
											<span className='font-mono text-xs'>
												{history.ipAddress}
											</span>
										</div>
										<div className='flex justify-between'>
											<span className='text-muted-foreground'>
												{loginHistoryPage?.location ||
													"Location"}
												:
											</span>
											<span>
												{history.location?.city &&
												history.location?.country
													? `${history.location.city}, ${history.location.country}`
													: "-"}
											</span>
										</div>
										<div className='flex justify-between'>
											<span className='text-muted-foreground'>
												{loginHistoryPage?.loginDate ||
													"Login Date"}
												:
											</span>
											<span>
												{formatDate(history.loginAt)}
											</span>
										</div>
										{history.logoutAt && (
											<div className='flex justify-between'>
												<span className='text-muted-foreground'>
													{loginHistoryPage?.logoutDate ||
														"Logged out"}
													:
												</span>
												<span>
													{formatDate(
														history.logoutAt
													)}
												</span>
											</div>
										)}
										{history.isActive &&
											(!currentDevice ||
												currentDevice._id !==
													history._id) && (
												<div className='pt-2'>
													<Button
														variant='outline'
														size='sm'
														onClick={() =>
															handleLogoutSession(
																history._id
															)
														}
														className='w-full text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300'
													>
														<LogOut className='w-3 h-3 mr-1' />
														{loginHistoryPage?.logout ||
															"Logout"}
													</Button>
												</div>
											)}
									</div>
								</div>
							))}
						</div>

						{totalPages > 1 && (
							<div className='border-t border-border px-6 py-4 flex items-center justify-between'>
								<div className='text-sm text-muted-foreground'>
									{loginHistoryPage?.page || "Page"} {page}{" "}
									{loginHistoryPage?.of || "of"} {totalPages}{" "}
									({total}{" "}
									{loginHistoryPage?.noLoginHistory?.toLowerCase() ||
										"login sessions"}
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
											{loginHistoryPage?.previous ||
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
											{loginHistoryPage?.next || "Next"}
										</span>
										<ChevronRight className='w-4 h-4' />
									</Button>
								</div>
							</div>
						)}
					</>
				)}
			</div>

			<ConfirmDialog
				isOpen={showLogoutAllDialog}
				onClose={() => setShowLogoutAllDialog(false)}
				onConfirm={handleLogoutAll}
				title={settings?.logoutAll || "Logout All Sessions"}
				message={
					settings?.logoutAllConfirm ||
					"Are you sure you want to logout from all devices? This will end all active sessions."
				}
				confirmText={settings?.logoutAll || "Logout All"}
				cancelText={settings?.cancel || "Cancel"}
			/>
		</div>
	);
};

export default LoginHistoryPage;
