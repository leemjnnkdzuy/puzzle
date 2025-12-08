import React, {useState, useEffect, useMemo} from "react";
import {
	Palette,
	Globe,
	User,
	Sun,
	Moon,
	Lock,
	Mail,
	AtSign,
	Check,
	X,
	ChevronDown,
	Clock,
	LogOut,
	ArrowRight,
} from "lucide-react";
import {useNavigate} from "react-router-dom";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Overlay from "@/components/ui/Overlay";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import Loading from "@/components/ui/Loading";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {cn} from "@/utils";
import {useAuth} from "@/hooks/useAuth";
import {useTheme} from "@/hooks/useTheme";
import {useLanguage} from "@/hooks/useLanguage";
import {useGlobalNotificationPopup} from "@/hooks/useGlobalNotificationPopup";
import userService from "@/services/UserService";
import {useAuthStore} from "@/stores/authStore";
import authService from "@/services/AuthService";

interface UserData {
	_id?: string;
	username?: string;
	email?: string;
	first_name?: string;
	last_name?: string;
	avatar?: string;
	isEmailVerified?: boolean;
}

type ChangeEmailStep = 1 | 2 | 3 | 4 | 5;
type ChangeUsernameStep = 1 | 2 | 3;

const SettingsPage: React.FC = () => {
	const {user, loading: authLoading} = useAuth();
	const setUser = useAuthStore((state) => state.setUser);
	const {theme, setTheme} = useTheme();
	const {language, setLanguage} = useLanguage();
	const {showSuccess, showError} = useGlobalNotificationPopup();
	const {t} = useLanguage();
	const navigate = useNavigate();

	const userData = user as UserData | null;

	const settings = t("settings") as
		| {
				title?: string;
				appearance?: string;
				account?: string;
				notifications?: string;
				privacy?: string;
				theme?: string;
				language?: string;
				selectTheme?: string;
				selectLanguage?: string;
				accountInfo?: string;
				viewProfile?: string;
				emailVerified?: string;
				emailNotVerified?: string;
				changePassword?: string;
				currentPassword?: string;
				newPassword?: string;
				confirmPassword?: string;
				changePasswordSuccess?: string;
				changePasswordFailed?: string;
				changeEmail?: string;
				currentEmail?: string;
				newEmail?: string;
				changeEmailStep1?: string;
				changeEmailStep2?: string;
				changeEmailStep3?: string;
				changeEmailStep4?: string;
				changeEmailStep5?: string;
				sendPin?: string;
				enterPin?: string;
				verifyPin?: string;
				pinSent?: string;
				pinVerified?: string;
				changeEmailSuccess?: string;
				changeEmailFailed?: string;
				changeUsername?: string;
				username?: string;
				checkAvailability?: string;
				usernameExists?: string;
				usernameAvailable?: string;
				changeUsernameStep1?: string;
				changeUsernameStep2?: string;
				changeUsernameStep3?: string;
				changeUsernameSuccess?: string;
				changeUsernameFailed?: string;
				changeName?: string;
				firstName?: string;
				lastName?: string;
				changeNameSuccess?: string;
				changeNameFailed?: string;
				loginHistory?: string;
				viewAllLoginHistory?: string;
				logoutAll?: string;
				currentDevice?: string;
				active?: string;
				loggedOut?: string;
				unknownBrowser?: string;
				ipAddress?: string;
				loggedOutAt?: string;
				noLoginHistory?: string;
				showing?: string;
				of?: string;
				previous?: string;
				next?: string;
				logout?: string;
				logoutSessionSuccess?: string;
				logoutSessionFailed?: string;
				logoutAllConfirm?: string;
				logoutAllDialogTitle?: string;
				logoutAllSuccess?: string;
				logoutAllFailed?: string;
				checkUsernameFirst?: string;
				notificationSettings?: string;
				emailNotifications?: string;
				pushNotifications?: string;
				comingSoon?: string;
				privacySettings?: string;
				profileVisibility?: string;
				dataUsage?: string;
				save?: string;
				cancel?: string;
				loading?: string;
				errors?: {
					currentPasswordRequired?: string;
					newPasswordRequired?: string;
					confirmPasswordRequired?: string;
					passwordsDoNotMatch?: string;
					newEmailRequired?: string;
					invalidEmail?: string;
					usernameRequired?: string;
					invalidUsername?: string;
					pinRequired?: string;
					invalidPin?: string;
					firstNameRequired?: string;
					lastNameRequired?: string;
				};
		  }
		| undefined;

	const [showChangePassword, setShowChangePassword] = useState(false);
	const [passwordData, setPasswordData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [passwordLoading, setPasswordLoading] = useState(false);
	const [showPassword, setShowPassword] = useState({
		current: false,
		new: false,
		confirm: false,
	});

	const [showChangeEmail, setShowChangeEmail] = useState(false);
	const [emailStep, setEmailStep] = useState<ChangeEmailStep>(1);
	const [emailData, setEmailData] = useState({
		currentPin: "",
		newEmail: "",
		newPin: "",
		tempToken: "",
	});
	const [emailLoading, setEmailLoading] = useState(false);

	const [showChangeUsername, setShowChangeUsername] = useState(false);
	const [usernameStep, setUsernameStep] = useState<ChangeUsernameStep>(1);
	const [usernameData, setUsernameData] = useState({
		newUsername: "",
		pin: "",
	});
	const [usernameLoading, setUsernameLoading] = useState(false);
	const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
		null
	);
	const [checkingUsername, setCheckingUsername] = useState(false);
	const [checkedUsername, setCheckedUsername] = useState<string>("");

	const [showChangeName, setShowChangeName] = useState(false);
	const [nameData, setNameData] = useState({
		firstName: "",
		lastName: "",
	});
	const [nameLoading, setNameLoading] = useState(false);

	const [loginHistory, setLoginHistory] = useState<
		Array<{
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
		}>
	>([]);
	const [loginHistoryLoading, setLoginHistoryLoading] = useState(false);
	const [showLogoutAllDialog, setShowLogoutAllDialog] = useState(false);
	const [logoutAllLoading, setLogoutAllLoading] = useState(false);

	const handlePasswordChange = (field: string, value: string) => {
		setPasswordData((prev) => ({...prev, [field]: value}));
	};

	const handleChangePassword = async () => {
		const errors = settings?.errors;
		if (!passwordData.currentPassword) {
			showError(
				errors?.currentPasswordRequired ||
					"Current password is required"
			);
			return;
		}
		if (!passwordData.newPassword) {
			showError(
				errors?.newPasswordRequired || "New password is required"
			);
			return;
		}
		if (!passwordData.confirmPassword) {
			showError(
				errors?.confirmPasswordRequired ||
					"Please confirm your password"
			);
			return;
		}
		if (passwordData.newPassword !== passwordData.confirmPassword) {
			showError(errors?.passwordsDoNotMatch || "Passwords do not match");
			return;
		}

		setPasswordLoading(true);
		try {
			const result = await userService.changePassword({
				currentPassword: passwordData.currentPassword,
				newPassword: passwordData.newPassword,
			});

			if (result.success) {
				showSuccess(
					settings?.changePasswordSuccess ||
						"Password changed successfully!"
				);
				setPasswordData({
					currentPassword: "",
					newPassword: "",
					confirmPassword: "",
				});
				setTimeout(() => {
					setShowChangePassword(false);
				}, 1500);
			} else {
				showError(
					result.message ||
						settings?.changePasswordFailed ||
						"Failed to change password"
				);
			}
		} catch (error) {
			showError(
				error instanceof Error
					? error.message
					: settings?.changePasswordFailed ||
							"Failed to change password"
			);
		} finally {
			setPasswordLoading(false);
		}
	};

	const handleRequestChangeEmailCurrent = async () => {
		setEmailLoading(true);
		try {
			const result = await userService.requestChangeEmailCurrent();
			if (result.success) {
				showSuccess(settings?.pinSent || "Verification code sent!");
				setEmailStep(2);
			} else {
				showError(result.message || "Failed to send verification code");
			}
		} catch (error) {
			showError(
				error instanceof Error
					? error.message
					: "Failed to send verification code"
			);
		} finally {
			setEmailLoading(false);
		}
	};

	const handleVerifyChangeEmailCurrent = async () => {
		if (!emailData.currentPin || emailData.currentPin.length !== 6) {
			showError(
				settings?.errors?.invalidPin || "Invalid verification code"
			);
			return;
		}

		setEmailLoading(true);
		try {
			const result = await userService.verifyChangeEmailCurrent(
				emailData.currentPin
			);
			if (result.success && result.data?.tempToken) {
				setEmailData((prev) => ({
					...prev,
					tempToken: result.data!.tempToken,
				}));
				showSuccess(settings?.pinVerified || "Current email verified!");
				setEmailStep(3);
			} else {
				showError(result.message || "Invalid verification code");
			}
		} catch (error) {
			showError(
				error instanceof Error
					? error.message
					: "Invalid verification code"
			);
		} finally {
			setEmailLoading(false);
		}
	};

	const handleRequestChangeEmailNew = async () => {
		const errors = settings?.errors;
		if (!emailData.newEmail) {
			showError(errors?.newEmailRequired || "New email is required");
			return;
		}
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(emailData.newEmail)) {
			showError(errors?.invalidEmail || "Invalid email format");
			return;
		}

		setEmailLoading(true);
		try {
			const result = await userService.requestChangeEmailNew({
				newEmail: emailData.newEmail,
				tempToken: emailData.tempToken,
			});
			if (result.success) {
				showSuccess(
					settings?.pinSent || "Verification code sent to new email!"
				);
				setEmailStep(4);
			} else {
				showError(result.message || "Failed to send verification code");
			}
		} catch (error) {
			showError(
				error instanceof Error
					? error.message
					: "Failed to send verification code"
			);
		} finally {
			setEmailLoading(false);
		}
	};

	const handleVerifyChangeEmailNew = async () => {
		if (!emailData.newPin || emailData.newPin.length !== 6) {
			showError(
				settings?.errors?.invalidPin || "Invalid verification code"
			);
			return;
		}

		setEmailLoading(true);
		try {
			const result = await userService.verifyChangeEmailNew({
				code: emailData.newPin,
				newEmail: emailData.newEmail,
			});
			if (result.success) {
				showSuccess(
					settings?.changeEmailSuccess ||
						"Email changed successfully!"
				);
				const userResult = await authService.getCurrentUser();
				if (userResult.success && userResult.data?.user) {
					setUser(userResult.data.user);
				}
				setEmailStep(5);
				setTimeout(() => {
					setShowChangeEmail(false);
					setEmailStep(1);
					setEmailData({
						currentPin: "",
						newEmail: "",
						newPin: "",
						tempToken: "",
					});
				}, 2000);
			} else {
				showError(
					result.message ||
						settings?.changeEmailFailed ||
						"Failed to change email"
				);
			}
		} catch (error) {
			showError(
				error instanceof Error
					? error.message
					: settings?.changeEmailFailed || "Failed to change email"
			);
		} finally {
			setEmailLoading(false);
		}
	};

	const handleCheckUsername = async () => {
		const errors = settings?.errors;
		if (!usernameData.newUsername) {
			showError(errors?.usernameRequired || "Username is required");
			return;
		}
		if (usernameData.newUsername.length < 6) {
			showError(
				errors?.invalidUsername ||
					"Username must be at least 6 characters"
			);
			return;
		}

		setCheckingUsername(true);
		try {
			const result = await userService.checkUsername(
				usernameData.newUsername
			);
			if (result.success) {
				if (result.available) {
					setUsernameAvailable(true);
					setCheckedUsername(usernameData.newUsername);
					showSuccess(
						settings?.usernameAvailable || "Username is available!"
					);
				} else {
					setUsernameAvailable(false);
					setCheckedUsername(usernameData.newUsername);
					showError(
						result.message ||
							settings?.usernameExists ||
							"Username is already taken"
					);
				}
			} else {
				setUsernameAvailable(false);
				setCheckedUsername(usernameData.newUsername);
				showError(result.message || "Failed to check username");
			}
		} catch (error) {
			setUsernameAvailable(false);
			showError(
				error instanceof Error
					? error.message
					: "Failed to check username"
			);
		} finally {
			setCheckingUsername(false);
		}
	};

	const handleRequestChangeUsername = async () => {
		if (usernameAvailable !== true) {
			showError(
				settings?.checkUsernameFirst ||
					"Please check username availability first"
			);
			return;
		}

		setUsernameLoading(true);
		try {
			const result = await userService.requestChangeUsername();
			if (result.success) {
				showSuccess(settings?.pinSent || "Verification code sent!");
				setUsernameStep(2);
			} else {
				showError(result.message || "Failed to send verification code");
			}
		} catch (error) {
			showError(
				error instanceof Error
					? error.message
					: "Failed to send verification code"
			);
		} finally {
			setUsernameLoading(false);
		}
	};

	const handleVerifyChangeUsername = async () => {
		if (!usernameData.pin || usernameData.pin.length !== 6) {
			showError(
				settings?.errors?.invalidPin || "Invalid verification code"
			);
			return;
		}

		setUsernameLoading(true);
		try {
			const result = await userService.verifyChangeUsername({
				username: usernameData.newUsername,
				code: usernameData.pin,
			});
			if (result.success) {
				showSuccess(
					settings?.changeUsernameSuccess ||
						"Username changed successfully!"
				);
				const userResult = await authService.getCurrentUser();
				if (userResult.success && userResult.data?.user) {
					setUser(userResult.data.user);
				}
				setUsernameStep(3);
				setTimeout(() => {
					setShowChangeUsername(false);
					setUsernameStep(1);
					setUsernameData({
						newUsername: "",
						pin: "",
					});
					setUsernameAvailable(null);
					setCheckedUsername("");
				}, 2000);
			} else {
				showError(
					result.message ||
						settings?.changeUsernameFailed ||
						"Failed to change username"
				);
			}
		} catch (error) {
			showError(
				error instanceof Error
					? error.message
					: settings?.changeUsernameFailed ||
							"Failed to change username"
			);
		} finally {
			setUsernameLoading(false);
		}
	};

	const handleChangeName = async () => {
		const errors = settings?.errors;
		if (!nameData.firstName.trim()) {
			showError(errors?.firstNameRequired || "First name is required");
			return;
		}
		if (!nameData.lastName.trim()) {
			showError(errors?.lastNameRequired || "Last name is required");
			return;
		}

		setNameLoading(true);
		try {
			const result = await authService.updateProfile({
				first_name: nameData.firstName.trim(),
				last_name: nameData.lastName.trim(),
			});

			if (result.success) {
				showSuccess(
					settings?.changeNameSuccess || "Name changed successfully!"
				);
				const userResult = await authService.getCurrentUser();
				if (userResult.success && userResult.data?.user) {
					setUser(userResult.data.user);
				}
				setNameData({
					firstName: "",
					lastName: "",
				});
				setTimeout(() => {
					setShowChangeName(false);
				}, 1500);
			} else {
				showError(
					result.message ||
						settings?.changeNameFailed ||
						"Failed to change name"
				);
			}
		} catch (error) {
			showError(
				error instanceof Error
					? error.message
					: settings?.changeNameFailed || "Failed to change name"
			);
		} finally {
			setNameLoading(false);
		}
	};

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

	useEffect(() => {
		const fetchLoginHistory = async () => {
			setLoginHistoryLoading(true);
			try {
				const result = await authService.getLoginHistory({
					page: 1,
					limit: 10,
				});
				if (result.success && result.data) {
					setLoginHistory(result.data.loginHistory);
				}
			} catch (error) {
				console.error("Failed to fetch login history:", error);
			} finally {
				setLoginHistoryLoading(false);
			}
		};

		if (user) {
			fetchLoginHistory();
		}
	}, [user]);

	const handleLogoutSession = async (sessionId: string) => {
		try {
			const result = await authService.logoutSession(sessionId);
			if (result.success) {
				showSuccess(
					settings?.logoutSessionSuccess ||
						"Session logged out successfully"
				);
				const result = await authService.getLoginHistory({
					page: 1,
					limit: 10,
				});
				if (result.success && result.data) {
					setLoginHistory(result.data.loginHistory);
				}
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
		setLogoutAllLoading(true);
		try {
			const result = await authService.logoutAllSessions();
			if (result.success) {
				showSuccess(
					settings?.logoutAllSuccess ||
						"All sessions logged out successfully"
				);
				setShowLogoutAllDialog(false);

				useAuthStore.getState().silentLogout();
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
		} finally {
			setLogoutAllLoading(false);
		}
	};

	if (authLoading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<Loading size='lg' />
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-background p-4 md:p-8'>
			<div className='max-w-6xl mx-auto'>
				<div className='mb-8'>
					<h1 className='text-3xl font-semibold text-foreground flex items-center gap-2'>
						{settings?.title || "Settings"}
					</h1>
				</div>

				<div className='space-y-6'>
					<div className='rounded-lg border border-input bg-card p-6 shadow-sm'>
						<div className='flex items-center gap-3 mb-6'>
							<User className='w-5 h-5 text-primary' />
							<h2 className='text-xl font-semibold text-foreground'>
								{settings?.account || "Account"}
							</h2>
						</div>

						<div className='space-y-6'>
							<div>
								<label className='block text-sm font-medium text-foreground mb-2'>
									{settings?.accountInfo ||
										"Account Information"}
								</label>
								<div className='space-y-2 p-4 bg-accent/50 rounded-md border border-input'>
									<div className='flex items-center justify-between'>
										<span className='text-sm text-muted-foreground'>
											{settings?.username || "Username"}:
										</span>
										<span className='text-sm font-medium text-foreground'>
											{userData?.username || "N/A"}
										</span>
									</div>
									<div className='flex items-center justify-between'>
										<span className='text-sm text-muted-foreground'>
											{settings?.currentEmail || "Email"}:
										</span>
										<div className='flex items-center gap-2'>
											<span className='text-sm font-medium text-foreground'>
												{userData?.email || "N/A"}
											</span>
											{userData?.isEmailVerified ? (
												<Check className='w-3 h-3 text-green-600 dark:text-green-400' />
											) : (
												<X className='w-3 h-3 text-red-600 dark:text-red-400' />
											)}
										</div>
									</div>
								</div>
							</div>

							<div className='border-t border-input pt-6'>
								<div className='flex items-center justify-between mb-4'>
									<label className='text-sm font-medium text-foreground flex items-center gap-2'>
										<User className='w-4 h-4' />
										{settings?.changeName || "Change Name"}
									</label>
									<Button
										variant='default'
										size='sm'
										className='min-w-[140px]'
										onClick={() => {
											setShowChangeName(true);
											setNameData({
												firstName:
													userData?.first_name || "",
												lastName:
													userData?.last_name || "",
											});
										}}
									>
										{settings?.changeName || "Change Name"}
									</Button>
								</div>
							</div>

							<div className='border-t border-input pt-6'>
								<div className='flex items-center justify-between mb-4'>
									<label className='text-sm font-medium text-foreground flex items-center gap-2'>
										<Lock className='w-4 h-4' />
										{settings?.changePassword ||
											"Change Password"}
									</label>
									<Button
										variant='default'
										size='sm'
										className='min-w-[140px]'
										onClick={() => {
											setShowChangePassword(true);
										}}
									>
										{settings?.changePassword ||
											"Change Password"}
									</Button>
								</div>
							</div>

							<div className='border-t border-input pt-6'>
								<div className='flex items-center justify-between mb-4'>
									<label className='text-sm font-medium text-foreground flex items-center gap-2'>
										<Mail className='w-4 h-4' />
										{settings?.changeEmail ||
											"Change Email"}
									</label>
									<Button
										variant='default'
										size='sm'
										className='min-w-[140px]'
										onClick={() => {
											setShowChangeEmail(true);
											setEmailStep(1);
											setEmailData({
												currentPin: "",
												newEmail: "",
												newPin: "",
												tempToken: "",
											});
										}}
									>
										{settings?.changeEmail ||
											"Change Email"}
									</Button>
								</div>
							</div>

							<div className='border-t border-input pt-6'>
								<div className='flex items-center justify-between mb-4'>
									<label className='text-sm font-medium text-foreground flex items-center gap-2'>
										<AtSign className='w-4 h-4' />
										{settings?.changeUsername ||
											"Change Username"}
									</label>
									<Button
										variant='default'
										size='sm'
										className='min-w-[140px]'
										onClick={() => {
											setShowChangeUsername(true);
											setUsernameStep(1);
											setUsernameData({
												newUsername: "",
												pin: "",
											});
											setUsernameAvailable(null);
											setCheckedUsername("");
										}}
									>
										{settings?.changeUsername ||
											"Change Username"}
									</Button>
								</div>
							</div>
						</div>
					</div>

					<div className='rounded-lg border border-input bg-card p-6 shadow-sm'>
						<div className='flex items-center gap-3 mb-6'>
							<Palette className='w-5 h-5 text-primary' />
							<h2 className='text-xl font-semibold text-foreground'>
								{settings?.appearance || "Appearance"}
							</h2>
						</div>

						<div className='space-y-6'>
							<div className='flex items-center justify-between gap-4'>
								<label className='text-sm font-medium text-foreground flex-shrink-0'>
									{settings?.theme || "Theme"}
								</label>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<button
											type='button'
											className='file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 min-w-[150px] rounded-md border bg-accent/50 px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[2px] flex items-center justify-between text-left'
										>
											<span className='flex items-center gap-2'>
												{theme === "light" ? (
													<>
														<Sun className='w-4 h-4' />
														{language === "vi"
															? "Sáng"
															: "Light"}
													</>
												) : (
													<>
														<Moon className='w-4 h-4' />
														{language === "vi"
															? "Tối"
															: "Dark"}
													</>
												)}
											</span>
											<ChevronDown className='h-4 w-4 opacity-50' />
										</button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align='end'
										className='min-w-[var(--radix-dropdown-menu-trigger-width)]'
									>
										<DropdownMenuItem
											onSelect={() => setTheme("light")}
											className={cn(
												"cursor-pointer",
												theme === "light" && "bg-accent"
											)}
										>
											<Sun className='w-4 h-4 mr-2' />
											{language === "vi"
												? "Sáng"
												: "Light"}
										</DropdownMenuItem>
										<DropdownMenuItem
											onSelect={() => setTheme("dark")}
											className={cn(
												"cursor-pointer",
												theme === "dark" && "bg-accent"
											)}
										>
											<Moon className='w-4 h-4 mr-2' />
											{language === "vi" ? "Tối" : "Dark"}
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>

							<div className='flex items-center justify-between gap-4'>
								<label className='text-sm font-medium text-foreground flex-shrink-0'>
									{settings?.language || "Language"}
								</label>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<button
											type='button'
											className='file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 min-w-[150px] rounded-md border bg-accent/50 px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[2px] flex items-center justify-between text-left'
										>
											<span className='flex items-center gap-2'>
												<Globe className='w-4 h-4' />
												{language === "vi"
													? "Tiếng Việt"
													: "English"}
											</span>
											<ChevronDown className='h-4 w-4 opacity-50' />
										</button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align='end'
										className='min-w-[var(--radix-dropdown-menu-trigger-width)]'
									>
										<DropdownMenuItem
											onSelect={() => setLanguage("en")}
											className={cn(
												"cursor-pointer",
												language === "en" && "bg-accent"
											)}
										>
											<Globe className='w-4 h-4 mr-2' />
											English
										</DropdownMenuItem>
										<DropdownMenuItem
											onSelect={() => setLanguage("vi")}
											className={cn(
												"cursor-pointer",
												language === "vi" && "bg-accent"
											)}
										>
											<Globe className='w-4 h-4 mr-2' />
											Tiếng Việt
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</div>
					</div>

					<div className='rounded-lg border border-input bg-card p-6 shadow-sm'>
						<div className='flex items-center justify-between mb-6'>
							<div className='flex items-center gap-3'>
								<Clock className='w-5 h-5 text-primary' />
								<h2 className='text-xl font-semibold text-foreground'>
									{settings?.loginHistory || "Login History"}
								</h2>
							</div>
							<Button
								variant='outline'
								size='sm'
								onClick={() => setShowLogoutAllDialog(true)}
								className='flex items-center gap-2'
							>
								<LogOut className='w-4 h-4' />
								{settings?.logoutAll || "Logout All"}
							</Button>
						</div>

						{loginHistoryLoading ? (
							<div className='flex items-center justify-center py-8'>
								<Loading size='md' />
							</div>
						) : loginHistory.length === 0 ? (
							<div className='text-center py-8 text-muted-foreground'>
								<p>
									{settings?.noLoginHistory ||
										"No login history found"}
								</p>
							</div>
						) : (
							<>
								<div className='space-y-4 relative'>
									{loginHistory
										.slice(0, 3)
										.map((history, index) => {
											const loginDate = new Date(
												history.loginAt
											);
											const formatDate = (date: Date) => {
												const locale =
													language === "vi"
														? "vi-VN"
														: "en-US";
												return new Intl.DateTimeFormat(
													locale,
													{
														year: "numeric",
														month: "short",
														day: "numeric",
														hour: "2-digit",
														minute: "2-digit",
													}
												).format(date);
											};

											const isLastOfThree =
												index === 2 &&
												loginHistory.length > 3;

											return (
												<div
													key={history._id}
													className={cn(
														"p-4 rounded-md border border-input bg-accent/50 relative",
														isLastOfThree &&
															"opacity-50"
													)}
												>
													{isLastOfThree && (
														<div className='absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent pointer-events-none rounded-md' />
													)}
													<div className='flex items-start justify-between mb-2'>
														<div className='flex-1'>
															<div className='flex items-center gap-2 mb-1'>
																<span className='text-sm font-medium text-foreground'>
																	{history
																		.deviceInfo
																		.browser ||
																		history
																			.deviceInfo
																			.platform ||
																		settings?.unknownBrowser ||
																		"Unknown Browser"}
																</span>
																{history.isActive &&
																	(!currentDevice ||
																		currentDevice._id !==
																			history._id) && (
																		<span className='px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded'>
																			{settings?.active ||
																				"Active"}
																		</span>
																	)}
																{history.logoutAt &&
																	!history.isActive && (
																		<span className='px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded'>
																			{settings?.loggedOut ||
																				"Logged out"}
																		</span>
																	)}
																{currentDevice &&
																	currentDevice._id ===
																		history._id && (
																		<span className='px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded'>
																			{settings?.currentDevice ||
																				"Current Device"}
																		</span>
																	)}
																{history.isActive &&
																	(!currentDevice ||
																		currentDevice._id !==
																			history._id) && (
																		<Button
																			variant='text'
																			size='sm'
																			onClick={() =>
																				handleLogoutSession(
																					history._id
																				)
																			}
																			className='h-6 px-2 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300'
																		>
																			<LogOut className='w-3 h-3 mr-1' />
																			{settings?.logout ||
																				"Logout"}
																		</Button>
																	)}
															</div>
															<div className='text-xs text-muted-foreground space-y-1'>
																{history
																	.deviceInfo
																	.os && (
																	<div>
																		{
																			history
																				.deviceInfo
																				.os
																		}
																		{history
																			.deviceInfo
																			.device &&
																			` • ${history.deviceInfo.device}`}
																	</div>
																)}
																<div>
																	{settings?.ipAddress ||
																		"IP"}
																	:{" "}
																	{
																		history.ipAddress
																	}
																	{history
																		.location
																		?.city &&
																		history
																			.location
																			?.country &&
																		` • ${history.location.city}, ${history.location.country}`}
																</div>
															</div>
														</div>
														<div className='text-right'>
															<div className='text-sm font-medium text-foreground'>
																{formatDate(
																	loginDate
																)}
															</div>
															{history.logoutAt && (
																<div className='text-xs text-muted-foreground mt-1'>
																	{settings?.loggedOutAt ||
																		"Logged out"}
																	:{" "}
																	{formatDate(
																		new Date(
																			history.logoutAt
																		)
																	)}
																</div>
															)}
														</div>
													</div>
												</div>
											);
										})}
								</div>
								{loginHistory.length > 3 && (
									<Button
										variant='outline'
										size='sm'
										className='w-full mt-4 group'
										onClick={() =>
											navigate("/login-history")
										}
									>
										{settings?.viewAllLoginHistory ||
											"View All Login History"}
										<ArrowRight className='w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1' />
									</Button>
								)}
							</>
						)}
					</div>
				</div>
			</div>

			<Overlay
				isOpen={showChangePassword}
				onClose={() => {
					setShowChangePassword(false);
					setPasswordData({
						currentPassword: "",
						newPassword: "",
						confirmPassword: "",
					});
				}}
			>
				<div className='p-6'>
					<div className='flex items-center justify-between mb-6'>
						<h2 className='text-xl font-semibold text-foreground flex items-center gap-2'>
							<Lock className='w-5 h-5' />
							{settings?.changePassword || "Change Password"}
						</h2>
						<Button
							variant='text'
							size='icon'
							onClick={() => {
								setShowChangePassword(false);
								setPasswordData({
									currentPassword: "",
									newPassword: "",
									confirmPassword: "",
								});
							}}
						>
							<X className='w-5 h-5' />
						</Button>
					</div>
					<div className='space-y-4'>
						<Input
							type='password'
							placeholder={
								settings?.currentPassword || "Current Password"
							}
							value={passwordData.currentPassword}
							onChange={(e) =>
								handlePasswordChange(
									"currentPassword",
									e.target.value
								)
							}
							showPassword={showPassword.current}
							onShowPasswordChange={(show) =>
								setShowPassword((prev) => ({
									...prev,
									current: show,
								}))
							}
						/>
						<Input
							type='password'
							placeholder={
								settings?.newPassword || "New Password"
							}
							value={passwordData.newPassword}
							onChange={(e) =>
								handlePasswordChange(
									"newPassword",
									e.target.value
								)
							}
							showPassword={showPassword.new}
							onShowPasswordChange={(show) =>
								setShowPassword((prev) => ({
									...prev,
									new: show,
								}))
							}
						/>
						<Input
							type='password'
							placeholder={
								settings?.confirmPassword || "Confirm Password"
							}
							value={passwordData.confirmPassword}
							onChange={(e) =>
								handlePasswordChange(
									"confirmPassword",
									e.target.value
								)
							}
							showPassword={showPassword.confirm}
							onShowPasswordChange={(show) =>
								setShowPassword((prev) => ({
									...prev,
									confirm: show,
								}))
							}
						/>
						<div className='flex gap-3 mt-4'>
							<Button
								variant='primary'
								onClick={handleChangePassword}
								loading={passwordLoading}
								disabled={passwordLoading}
								className='flex-1'
							>
								{settings?.save || "Save"}
							</Button>
							<Button
								variant='outline'
								onClick={() => {
									setShowChangePassword(false);
									setPasswordData({
										currentPassword: "",
										newPassword: "",
										confirmPassword: "",
									});
								}}
								disabled={passwordLoading}
								className='flex-1'
							>
								{settings?.cancel || "Cancel"}
							</Button>
						</div>
					</div>
				</div>
			</Overlay>

			<Overlay
				isOpen={showChangeEmail}
				onClose={() => {
					setShowChangeEmail(false);
					setEmailStep(1);
					setEmailData({
						currentPin: "",
						newEmail: "",
						newPin: "",
						tempToken: "",
					});
				}}
			>
				<div className='p-6'>
					<div className='flex items-center justify-between mb-6'>
						<h2 className='text-xl font-semibold text-foreground flex items-center gap-2'>
							<Mail className='w-5 h-5' />
							{settings?.changeEmail || "Change Email"}
						</h2>
						<Button
							variant='text'
							size='icon'
							onClick={() => {
								setShowChangeEmail(false);
								setEmailStep(1);
								setEmailData({
									currentPin: "",
									newEmail: "",
									newPin: "",
									tempToken: "",
								});
							}}
						>
							<X className='w-5 h-5' />
						</Button>
					</div>
					<div className='space-y-4'>
						<div className='flex items-center gap-2 mb-4'>
							{[1, 2, 3, 4, 5].map((step) => (
								<React.Fragment key={step}>
									<div
										className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
											emailStep >= step
												? "bg-primary text-primary-foreground"
												: "bg-accent border border-input"
										}`}
									>
										{step}
									</div>
									{step < 5 && (
										<div
											className={`h-1 flex-1 ${
												emailStep > step
													? "bg-primary"
													: "bg-accent"
											}`}
										/>
									)}
								</React.Fragment>
							))}
						</div>

						{emailStep === 1 && (
							<div className='flex items-center justify-between'>
								<p className='text-sm text-muted-foreground'>
									{settings?.changeEmailStep1 ||
										"Step 1: Verify your current email"}
								</p>
								<Button
									variant='primary'
									onClick={handleRequestChangeEmailCurrent}
									loading={emailLoading}
									disabled={emailLoading}
									className='min-w-[140px]'
								>
									{settings?.sendPin || "Send PIN"}
								</Button>
							</div>
						)}

						{emailStep === 2 && (
							<div className='space-y-4'>
								<p className='text-sm text-muted-foreground'>
									{settings?.changeEmailStep2 ||
										"Step 2: Enter verification code"}
								</p>
								<div className='flex gap-2'>
									<Input
										placeholder={
											settings?.enterPin ||
											"Enter verification code"
										}
										value={emailData.currentPin}
										onChange={(e) =>
											setEmailData((prev) => ({
												...prev,
												currentPin: e.target.value,
											}))
										}
										maxLength={6}
										containerClassName='flex-1'
										className='w-full'
									/>
									<Button
										variant='primary'
										onClick={handleVerifyChangeEmailCurrent}
										loading={emailLoading}
										disabled={emailLoading}
										className='min-w-[140px]'
									>
										{settings?.verifyPin || "Verify"}
									</Button>
								</div>
							</div>
						)}

						{emailStep === 3 && (
							<div className='space-y-4'>
								<p className='text-sm text-muted-foreground'>
									{settings?.changeEmailStep3 ||
										"Step 3: Enter new email"}
								</p>
								<div className='flex gap-2'>
									<Input
										type='email'
										placeholder={
											settings?.newEmail || "New Email"
										}
										value={emailData.newEmail}
										onChange={(e) =>
											setEmailData((prev) => ({
												...prev,
												newEmail: e.target.value,
											}))
										}
										containerClassName='flex-1'
										className='w-full'
									/>
									<Button
										variant='primary'
										onClick={handleRequestChangeEmailNew}
										loading={emailLoading}
										disabled={emailLoading}
										className='min-w-[140px]'
									>
										{settings?.sendPin || "Send PIN"}
									</Button>
								</div>
							</div>
						)}

						{emailStep === 4 && (
							<div className='space-y-4'>
								<p className='text-sm text-muted-foreground'>
									{settings?.changeEmailStep4 ||
										"Step 4: Verify new email"}
								</p>
								<div className='flex gap-2'>
									<Input
										placeholder={
											settings?.enterPin ||
											"Enter verification code"
										}
										value={emailData.newPin}
										onChange={(e) =>
											setEmailData((prev) => ({
												...prev,
												newPin: e.target.value,
											}))
										}
										maxLength={6}
										containerClassName='flex-1'
										className='w-full'
									/>
									<Button
										variant='primary'
										onClick={handleVerifyChangeEmailNew}
										loading={emailLoading}
										disabled={emailLoading}
										className='min-w-[140px]'
									>
										{settings?.verifyPin || "Verify"}
									</Button>
								</div>
							</div>
						)}

						{emailStep === 5 && (
							<div className='text-center py-4'>
								<Check className='w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-2' />
								<p className='text-sm font-medium text-foreground'>
									{settings?.changeEmailSuccess ||
										"Email changed successfully!"}
								</p>
							</div>
						)}
					</div>
				</div>
			</Overlay>

			<Overlay
				isOpen={showChangeUsername}
				onClose={() => {
					setShowChangeUsername(false);
					setUsernameStep(1);
					setUsernameData({
						newUsername: "",
						pin: "",
					});
					setUsernameAvailable(null);
					setCheckedUsername("");
				}}
			>
				<div className='p-6'>
					<div className='flex items-center justify-between mb-6'>
						<h2 className='text-xl font-semibold text-foreground flex items-center gap-2'>
							<AtSign className='w-5 h-5' />
							{settings?.changeUsername || "Change Username"}
						</h2>
						<Button
							variant='text'
							size='icon'
							onClick={() => {
								setShowChangeUsername(false);
								setUsernameStep(1);
								setUsernameData({
									newUsername: "",
									pin: "",
								});
								setUsernameAvailable(null);
								setCheckedUsername("");
							}}
						>
							<X className='w-5 h-5' />
						</Button>
					</div>
					<div className='space-y-4'>
						<div className='flex items-center gap-2 mb-4'>
							{[1, 2, 3].map((step) => (
								<React.Fragment key={step}>
									<div
										className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
											usernameStep >= step
												? "bg-primary text-primary-foreground"
												: "bg-accent border border-input"
										}`}
									>
										{step}
									</div>
									{step < 3 && (
										<div
											className={`h-1 flex-1 ${
												usernameStep > step
													? "bg-primary"
													: "bg-accent"
											}`}
										/>
									)}
								</React.Fragment>
							))}
						</div>

						{usernameStep === 1 && (
							<div className='space-y-4'>
								<p className='text-sm text-muted-foreground'>
									{settings?.changeUsernameStep1 ||
										"Step 1: Enter new username"}
								</p>
								<div className='flex gap-2'>
									<div className='relative flex-1'>
										<Input
											placeholder={
												settings?.username || "Username"
											}
											value={usernameData.newUsername}
											onChange={(e) => {
												const newValue =
													e.target.value.toLowerCase();
												setUsernameData((prev) => ({
													...prev,
													newUsername: newValue,
												}));
												if (
													newValue !== checkedUsername
												) {
													setUsernameAvailable(null);
												}
											}}
											className={`border-2 bg-background dark:bg-background ${
												usernameAvailable !== null
													? "pr-10"
													: ""
											}`}
										/>
										{usernameAvailable === true && (
											<div className='absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none'>
												<Check className='w-4 h-4 text-green-600 dark:text-green-400' />
											</div>
										)}
										{usernameAvailable === false && (
											<div className='absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none'>
												<X className='w-4 h-4 text-red-600 dark:text-red-400' />
											</div>
										)}
									</div>
									{usernameAvailable === true ? (
										<Button
											variant='primary'
											onClick={
												handleRequestChangeUsername
											}
											loading={usernameLoading}
											disabled={usernameLoading}
											className='whitespace-nowrap min-w-[140px]'
										>
											{settings?.sendPin || "Send PIN"}
										</Button>
									) : (
										<Button
											variant='default'
											onClick={handleCheckUsername}
											loading={checkingUsername}
											disabled={checkingUsername}
											className='whitespace-nowrap min-w-[140px]'
										>
											{settings?.checkAvailability ||
												"Check Availability"}
										</Button>
									)}
								</div>
							</div>
						)}

						{usernameStep === 2 && (
							<div className='space-y-4'>
								<p className='text-sm text-muted-foreground'>
									{settings?.changeUsernameStep2 ||
										"Step 2: Verify with PIN"}
								</p>
								<div className='flex gap-2 w-full'>
									<Input
										placeholder={
											settings?.enterPin ||
											"Enter verification code"
										}
										value={usernameData.pin}
										onChange={(e) =>
											setUsernameData((prev) => ({
												...prev,
												pin: e.target.value,
											}))
										}
										maxLength={6}
										containerClassName='flex-1'
										className='w-full min-w-0'
									/>
									<Button
										variant='primary'
										onClick={handleVerifyChangeUsername}
										loading={usernameLoading}
										disabled={usernameLoading}
										className='min-w-[140px]'
									>
										{settings?.verifyPin || "Verify"}
									</Button>
								</div>
							</div>
						)}

						{usernameStep === 3 && (
							<div className='text-center py-4'>
								<Check className='w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-2' />
								<p className='text-sm font-medium text-foreground'>
									{settings?.changeUsernameSuccess ||
										"Username changed successfully!"}
								</p>
							</div>
						)}
					</div>
				</div>
			</Overlay>

			<Overlay
				isOpen={showChangeName}
				onClose={() => {
					setShowChangeName(false);
					setNameData({
						firstName: "",
						lastName: "",
					});
				}}
			>
				<div className='p-6'>
					<div className='flex items-center justify-between mb-6'>
						<h2 className='text-xl font-semibold text-foreground flex items-center gap-2'>
							<User className='w-5 h-5' />
							{settings?.changeName || "Change Name"}
						</h2>
						<Button
							variant='text'
							size='icon'
							onClick={() => {
								setShowChangeName(false);
								setNameData({
									firstName: "",
									lastName: "",
								});
							}}
						>
							<X className='w-5 h-5' />
						</Button>
					</div>
					<div className='space-y-4'>
						<Input
							placeholder={settings?.firstName || "First Name"}
							value={nameData.firstName}
							onChange={(e) =>
								setNameData((prev) => ({
									...prev,
									firstName: e.target.value,
								}))
							}
						/>
						<Input
							placeholder={settings?.lastName || "Last Name"}
							value={nameData.lastName}
							onChange={(e) =>
								setNameData((prev) => ({
									...prev,
									lastName: e.target.value,
								}))
							}
						/>
						<div className='flex gap-3 mt-4'>
							<Button
								variant='primary'
								onClick={handleChangeName}
								loading={nameLoading}
								disabled={nameLoading}
								className='flex-1'
							>
								{settings?.save || "Save"}
							</Button>
							<Button
								variant='outline'
								onClick={() => {
									setShowChangeName(false);
									setNameData({
										firstName: "",
										lastName: "",
									});
								}}
								disabled={nameLoading}
								className='flex-1'
							>
								{settings?.cancel || "Cancel"}
							</Button>
						</div>
					</div>
				</div>
			</Overlay>

			<ConfirmDialog
				isOpen={showLogoutAllDialog}
				onClose={() => setShowLogoutAllDialog(false)}
				onConfirm={handleLogoutAll}
				title={settings?.logoutAllDialogTitle || "Logout All Devices"}
				message={
					settings?.logoutAllConfirm ||
					"Are you sure you want to logout from all devices? You will need to login again."
				}
				confirmText={settings?.logoutAll || "Logout All"}
				cancelText={settings?.cancel || "Cancel"}
				confirmVariant='destructive'
				isLoading={logoutAllLoading}
			/>
		</div>
	);
};

export default SettingsPage;
