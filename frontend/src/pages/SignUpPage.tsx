import React, {useState} from "react";
import {useNavigate, Link} from "react-router-dom";
import {FaArrowLeft} from "react-icons/fa";
import {Check, X} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Tooltip from "@/components/ui/Tooltip";
import authService from "@/services/AuthService";
import {useGlobalNotificationPopup} from "@/hooks/useGlobalNotificationPopup";
import {useLanguage} from "@/hooks/useLanguage";
import {
	calculatePasswordStrength,
	getPasswordRules,
	getPasswordStrengthColor,
	validateRegister,
} from "@/utils/utils";
import type {RegisterData} from "@/types/AuthTypes";

type SignUpPhase = "register" | "verification";

const SignUpPage: React.FC = () => {
	const navigate = useNavigate();
	const {showError, showSuccess} = useGlobalNotificationPopup();
	const {getNested, t} = useLanguage();
	const [phase, setPhase] = useState<SignUpPhase>("register");
	const [registerData, setRegisterData] = useState<RegisterData>({
		first_name: "",
		last_name: "",
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [verificationCode, setVerificationCode] = useState("");
	const [passwordFocused, setPasswordFocused] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const password = registerData.password || "";
	const score = calculatePasswordStrength(password);
	const dotColor = getPasswordStrengthColor(score);
	const rules = getPasswordRules(password, t);

	const passwordRequirementsTitle = getNested?.(
		"signUp.passwordRequirements"
	) as string;

	const renderPasswordRequirements = () => (
		<div className='min-w-[180px]'>
			<div className='font-semibold mb-1'>
				{passwordRequirementsTitle}
			</div>
			<div className='flex flex-col gap-1'>
				{rules.map((rule, idx) => (
					<span
						key={idx}
						className={`flex items-center gap-1 text-sm ${
							rule.test
								? "text-green-600 font-semibold"
								: "text-red-500"
						}`}
					>
						{rule.test ? (
							<Check className='w-4 h-4' />
						) : (
							<X className='w-4 h-4' />
						)}
						{rule.label}
					</span>
				))}
			</div>
		</div>
	);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const errorMsg = validateRegister(registerData, t);
		if (errorMsg) {
			showError(errorMsg);
			return;
		}

		setIsLoading(true);
		try {
			await authService.register(registerData);
			const registerSuccess = getNested?.(
				"signUp.errors.registerSuccess"
			) as string;
			showSuccess(registerSuccess);
			setPhase("verification");
		} catch (error) {
			const registerFailed = getNested?.(
				"signUp.errors.registerFailed"
			) as string;
			showError(error instanceof Error ? error.message : registerFailed);
		} finally {
			setIsLoading(false);
		}
	};

	const title = getNested?.("signUp.title") as string;
	const subtitle = getNested?.("signUp.subtitle") as string;
	const backToHome = getNested?.("signUp.backToHome") as string;
	const lastNamePlaceholder = getNested?.(
		"signUp.lastNamePlaceholder"
	) as string;
	const firstNamePlaceholder = getNested?.(
		"signUp.firstNamePlaceholder"
	) as string;
	const usernamePlaceholder = getNested?.(
		"signUp.usernamePlaceholder"
	) as string;
	const emailPlaceholder = getNested?.("signUp.emailPlaceholder") as string;
	const passwordPlaceholder = getNested?.(
		"signUp.passwordPlaceholder"
	) as string;
	const confirmPasswordPlaceholder = getNested?.(
		"signUp.confirmPasswordPlaceholder"
	) as string;
	const submit = getNested?.("signUp.submit") as string;
	const hasAccount = getNested?.("signUp.hasAccount") as string;
	const signIn = getNested?.("signUp.signIn") as string;

	// Verification phase translations
	const verificationTitle = getNested?.("verification.title") as string;
	const verificationSubtitle = getNested?.("verification.subtitle") as string;
	const codePlaceholder = getNested?.(
		"verification.codePlaceholder"
	) as string;
	const verifySubmit = getNested?.("verification.submit") as string;
	const verifyBack = getNested?.("verification.back") as string;

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
			const result = await authService.verify(verificationCode);
			if (result.success) {
				const verifySuccess = getNested?.(
					"verification.errors.verifySuccess"
				) as string;
				const accountCreated = getNested?.(
					"signUp.errors.accountCreated"
				) as string;
				showSuccess(accountCreated || verifySuccess);
				setTimeout(() => {
					navigate("/login");
				}, 1500);
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
					{phase === "register" ? title : verificationTitle}
				</h1>
				<p className='text-center text-gray-600 mb-8'>
					{phase === "register" ? subtitle : verificationSubtitle}
				</p>

				{phase === "register" ? (
					<form
						onSubmit={handleSubmit}
						className='space-y-4'
						noValidate
					>
						<div className='flex gap-4'>
							<Input
								type='text'
								placeholder={lastNamePlaceholder}
								value={registerData.last_name}
								onChange={(e) =>
									setRegisterData({
										...registerData,
										last_name: e.target.value,
									})
								}
								required
								className='flex-1'
							/>
							<Input
								type='text'
								placeholder={firstNamePlaceholder}
								value={registerData.first_name}
								onChange={(e) =>
									setRegisterData({
										...registerData,
										first_name: e.target.value,
									})
								}
								required
								className='flex-1'
							/>
						</div>

						<Input
							type='text'
							placeholder={usernamePlaceholder}
							value={registerData.username}
							onChange={(e) =>
								setRegisterData({
									...registerData,
									username: e.target.value.toLowerCase(),
								})
							}
							required
							className='w-full'
						/>

						<Input
							type='email'
							placeholder={emailPlaceholder}
							value={registerData.email}
							onChange={(e) =>
								setRegisterData({
									...registerData,
									email: e.target.value,
								})
							}
							required
							className='w-full'
						/>

						<div className='relative'>
							<Input
								type='password'
								placeholder={passwordPlaceholder}
								value={registerData.password}
								onFocus={() => setPasswordFocused(true)}
								onBlur={() => setPasswordFocused(false)}
								onChange={(e) =>
									setRegisterData({
										...registerData,
										password: e.target.value,
									})
								}
								required
								className='w-full'
							/>
							{(passwordFocused || password.length > 0) && (
								<Tooltip
									content={renderPasswordRequirements()}
									placement='right'
								>
									<span
										className='absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full transition-colors'
										style={{
											background: dotColor,
										}}
									/>
								</Tooltip>
							)}
						</div>

						<Input
							type='password'
							placeholder={confirmPasswordPlaceholder}
							value={registerData.confirmPassword}
							onChange={(e) =>
								setRegisterData({
									...registerData,
									confirmPassword: e.target.value,
								})
							}
							required
							className='w-full'
						/>

						<Button
							type='submit'
							loading={isLoading}
							disabled={score < 3}
							className='w-full bg-black text-white hover:bg-gray-800'
							size='lg'
						>
							{submit}
						</Button>
					</form>
				) : (
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
							loading={isLoading}
							className='w-full bg-black text-white hover:bg-gray-800'
							size='lg'
						>
							{verifySubmit}
						</Button>
						<Button
							type='button'
							onClick={() => setPhase("register")}
							variant='outline'
							className='w-full'
							disabled={isLoading}
						>
							{verifyBack}
						</Button>
					</form>
				)}

				{phase === "register" && (
					<div className='mt-6 text-center'>
						<p className='text-sm text-gray-600'>
							{hasAccount}{" "}
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

SignUpPage.displayName = "SignUpPage";
export default SignUpPage;
