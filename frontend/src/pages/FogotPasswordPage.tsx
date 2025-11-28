import React, {useState} from "react";
import {useNavigate, Link} from "react-router-dom";
import {FaArrowLeft} from "react-icons/fa";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Loading from "@/components/ui/Loading";
import authService from "@/services/AuthService";
import {useGlobalNotificationPopup} from "@/hooks/useGlobalNotificationPopup";
import {useLanguage} from "@/hooks/useLanguage";
import type {ForgotPasswordData, ResetPasswordData} from "@/types/AuthTypes";

type ForgotPasswordPhase = "forgotPassword" | "verification" | "resetPassword";

const FogotPasswordPage: React.FC = () => {
	const navigate = useNavigate();
	const {showError, showSuccess} = useGlobalNotificationPopup();
	const {getNested} = useLanguage();
	const [phase, setPhase] = useState<ForgotPasswordPhase>("forgotPassword");
	const [email, setEmail] = useState("");
	const [verificationCode, setVerificationCode] = useState("");
	const [resetToken, setResetToken] = useState("");
	const [resetPasswordData, setResetPasswordData] =
		useState<ResetPasswordData>({
			password: "",
			confirmPassword: "",
		});
	const [isLoading, setIsLoading] = useState(false);

	const validateEmail = (emailValue: string): string | null => {
		const emailRequired = getNested?.(
			"forgotPassword.errors.emailRequired"
		) as string;
		const emailInvalid = getNested?.(
			"forgotPassword.errors.emailInvalid"
		) as string;

		if (!emailValue || emailValue.trim().length === 0) {
			return emailRequired;
		}
		if (!/^\S+@\S+\.\S+$/.test(emailValue)) {
			return emailInvalid;
		}
		return null;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const errorMsg = validateEmail(email);
		if (errorMsg) {
			showError(errorMsg);
			return;
		}

		setIsLoading(true);

		try {
			const data: ForgotPasswordData = {email};
			const result = await authService.forgotPassword(data);
			const sendSuccess = getNested?.(
				"forgotPassword.errors.sendSuccess"
			) as string;
			const sendFailed = getNested?.(
				"forgotPassword.errors.sendFailed"
			) as string;

			if (result && result.success) {
				showSuccess(sendSuccess);
				setPhase("verification");
			} else {
				showError(result?.message || sendFailed);
			}
		} catch (error) {
			const sendFailed = getNested?.(
				"forgotPassword.errors.sendFailed"
			) as string;
			showError(error instanceof Error ? error.message : sendFailed);
		} finally {
			setIsLoading(false);
		}
	};

	const title = getNested?.("forgotPassword.title") as string;
	const subtitle = getNested?.("forgotPassword.subtitle") as string;
	const backToHome = getNested?.("forgotPassword.backToHome") as string;
	const emailPlaceholder = getNested?.(
		"forgotPassword.emailPlaceholder"
	) as string;
	const submit = getNested?.("forgotPassword.submit") as string;
	const rememberPassword = getNested?.(
		"forgotPassword.rememberPassword"
	) as string;
	const signIn = getNested?.("forgotPassword.signIn") as string;

	// Verification phase translations
	const verificationTitle = getNested?.("verification.title") as string;
	const verificationSubtitle = getNested?.("verification.subtitle") as string;
	const codePlaceholder = getNested?.(
		"verification.codePlaceholder"
	) as string;
	const verifySubmit = getNested?.("verification.submit") as string;
	const verifyBack = getNested?.("verification.back") as string;

	// Reset password phase translations
	const resetTitle = getNested?.("resetPassword.title") as string;
	const resetSubtitle = getNested?.("resetPassword.subtitle") as string;
	const resetPasswordPlaceholder = getNested?.(
		"resetPassword.passwordPlaceholder"
	) as string;
	const resetConfirmPasswordPlaceholder = getNested?.(
		"resetPassword.confirmPasswordPlaceholder"
	) as string;
	const resetSubmit = getNested?.("resetPassword.submit") as string;

	const handleVerify = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!verificationCode.trim()) {
			const codeRequired = getNested?.(
				"verification.errors.codeRequired"
			) as string;
			showError(codeRequired);
			return;
		}

		setIsLoading(true);
		try {
			const result = await authService.verifyResetPin({
				email,
				code: verificationCode,
			});
			if (result.success && result.resetToken) {
				setResetToken(result.resetToken);
				setPhase("resetPassword");
				const verifySuccess = getNested?.(
					"verification.errors.verifySuccess"
				) as string;
				showSuccess(verifySuccess);
			} else {
				const verifyFailed = getNested?.(
					"verification.errors.verifyFailed"
				) as string;
				showError(result.message || verifyFailed);
			}
		} catch (error) {
			const verifyFailed = getNested?.(
				"verification.errors.verifyFailed"
			) as string;
			showError(error instanceof Error ? error.message : verifyFailed);
		} finally {
			setIsLoading(false);
		}
	};

	const handleResetPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!resetPasswordData.password) {
			const passwordRequired = getNested?.(
				"resetPassword.errors.passwordRequired"
			) as string;
			showError(passwordRequired);
			return;
		}
		if (resetPasswordData.password !== resetPasswordData.confirmPassword) {
			const passwordMismatch = getNested?.(
				"resetPassword.errors.passwordMismatch"
			) as string;
			showError(passwordMismatch);
			return;
		}

		setIsLoading(true);
		try {
			const result = await authService.resetPassword({
				password: resetPasswordData.password,
				confirmPassword: resetPasswordData.confirmPassword,
				resetToken,
			});
			if (result.success) {
				const resetSuccess = getNested?.(
					"resetPassword.errors.resetSuccess"
				) as string;
				showSuccess(resetSuccess);
				setTimeout(() => {
					navigate("/login");
				}, 1500);
			} else {
				const resetFailed = getNested?.(
					"resetPassword.errors.resetFailed"
				) as string;
				showError(result.message || resetFailed);
			}
		} catch (error) {
			const resetFailed = getNested?.(
				"resetPassword.errors.resetFailed"
			) as string;
			showError(error instanceof Error ? error.message : resetFailed);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='relative flex flex-col justify-center items-center min-h-screen bg-gray-50 px-4 py-8'>
			<Button
				size='sm'
				className='absolute top-8 left-8 z-20 text-gray-400 hover:text-gray-600 hover:opacity-100 bg-transparent border-none shadow-none transition-colors duration-200'
				onClick={() => navigate("/")}
				variant='text'
			>
				<FaArrowLeft />
				{backToHome}
			</Button>

			<div className='w-full max-w-md rounded-2xl p-8'>
				<h1 className='text-3xl font-bold text-center mb-2 text-gray-900'>
					{phase === "forgotPassword"
						? title
						: phase === "verification"
						? verificationTitle
						: resetTitle}
				</h1>
				<p className='text-center text-gray-600 mb-8'>
					{phase === "forgotPassword"
						? subtitle
						: phase === "verification"
						? verificationSubtitle
						: resetSubtitle}
				</p>

				{phase === "forgotPassword" && (
					<form
						onSubmit={handleSubmit}
						className='space-y-6'
						noValidate
					>
						<div>
							<Input
								type='email'
								placeholder={emailPlaceholder}
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className='w-full'
							/>
						</div>

						<Button
							type='submit'
							disabled={isLoading}
							className='w-full bg-black text-white hover:bg-gray-800'
							size='lg'
						>
							{isLoading ? <Loading size={20} /> : submit}
						</Button>
					</form>
				)}

				{phase === "verification" && (
					<form
						onSubmit={handleVerify}
						className='space-y-6'
						noValidate
					>
						<Input
							type='text'
							placeholder={codePlaceholder}
							value={verificationCode}
							onChange={(e) =>
								setVerificationCode(e.target.value)
							}
							required
							className='w-full text-center text-2xl tracking-widest'
							maxLength={6}
						/>
						<Button
							type='submit'
							disabled={isLoading}
							className='w-full bg-black text-white hover:bg-gray-800'
							size='lg'
						>
							{isLoading ? <Loading size={20} /> : verifySubmit}
						</Button>
						<Button
							type='button'
							onClick={() => setPhase("forgotPassword")}
							variant='outline'
							className='w-full'
							disabled={isLoading}
						>
							{verifyBack}
						</Button>
					</form>
				)}

				{phase === "resetPassword" && (
					<form
						onSubmit={handleResetPassword}
						className='space-y-6'
						noValidate
					>
						<Input
							type='password'
							placeholder={resetPasswordPlaceholder}
							value={resetPasswordData.password}
							onChange={(e) =>
								setResetPasswordData({
									...resetPasswordData,
									password: e.target.value,
								})
							}
							required
							className='w-full'
						/>
						<Input
							type='password'
							placeholder={resetConfirmPasswordPlaceholder}
							value={resetPasswordData.confirmPassword}
							onChange={(e) =>
								setResetPasswordData({
									...resetPasswordData,
									confirmPassword: e.target.value,
								})
							}
							required
							className='w-full'
						/>
						<Button
							type='submit'
							disabled={isLoading}
							className='w-full bg-black text-white hover:bg-gray-800'
							size='lg'
						>
							{isLoading ? <Loading size={20} /> : resetSubmit}
						</Button>
					</form>
				)}

				{phase === "forgotPassword" && (
					<div className='mt-6 text-center'>
						<p className='text-sm text-gray-600'>
							{rememberPassword}{" "}
							<Link
								to='/login'
								className='text-blue-600 hover:text-blue-800 font-semibold hover:underline'
							>
								{signIn}
							</Link>
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

FogotPasswordPage.displayName = "FogotPasswordPage";
export default FogotPasswordPage;
