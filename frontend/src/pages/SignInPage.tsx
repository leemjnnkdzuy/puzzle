import React, {useState, useEffect} from "react";
import {useNavigate, Link} from "react-router-dom";
import {FaArrowLeft, FaGoogle, FaFacebook} from "react-icons/fa";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {useAuth} from "@/hooks/useAuth";
import {useGlobalNotificationPopup} from "@/hooks/useGlobalNotificationPopup";
import {useSocialLogin} from "@/hooks/useSocialLogin";
import {useLanguage} from "@/hooks/useLanguage";
import type {LoginData} from "@/services/AuthService";

const SignInPage: React.FC = () => {
	const navigate = useNavigate();
	const {login, isAuthenticated} = useAuth();
	const {showError} = useGlobalNotificationPopup();
	const {handleSocialLogin} = useSocialLogin();
	const {t} = useLanguage();
	const [loginData, setLoginData] = useState<LoginData>({
		username: "",
		password: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [rememberMe, setRememberMe] = useState(false);

	useEffect(() => {
		if (isAuthenticated) {
			navigate("/home", {replace: true});
		}
	}, [isAuthenticated, navigate]);

	const validateLogin = (data: LoginData): string | null => {
		const usernameRequired = t(
			"signIn.errors.usernameRequired"
		) as string;
		const passwordRequired = t(
			"signIn.errors.passwordRequired"
		) as string;

		if (!data.username || data.username.trim().length === 0) {
			return usernameRequired;
		}
		if (!data.password || data.password.length === 0) {
			return passwordRequired;
		}
		return null;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const errorMsg = validateLogin(loginData);
		if (errorMsg) {
			showError(errorMsg);
			return;
		}

		setIsLoading(true);

		try {
			const result = await login(loginData.username, loginData.password);
			const loginFailed = t(
				"signIn.errors.loginFailed"
			) as string;

			if (result && result.success) {
				// Navigation will be handled by useEffect when isAuthenticated changes
			} else {
				showError(result?.message || loginFailed);
			}
		} catch (error) {
			const loginFailed = t(
				"signIn.errors.loginFailed"
			) as string;
			showError(error instanceof Error ? error.message : loginFailed);
		} finally {
			setIsLoading(false);
		}
	};

	const title = t("signIn.title") as string;
	const subtitle = t("signIn.subtitle") as string;
	const backToHome = t("signIn.backToHome") as string;
	const usernamePlaceholder = t(
		"signIn.usernamePlaceholder"
	) as string;
	const passwordPlaceholder = t(
		"signIn.passwordPlaceholder"
	) as string;
	const forgotPassword = t("signIn.forgotPassword") as string;
	const rememberMeText = t("signIn.rememberMe") as string;
	const submit = t("signIn.submit") as string;
	const noAccount = t("signIn.noAccount") as string;
	const signUp = t("signIn.signUp") as string;
	const or = t("signIn.or") as string;
	const google = t("signIn.google") as string;
	const facebook = t("signIn.facebook") as string;

	return (
		<div className='relative flex flex-col justify-center items-center min-h-screen bg-background px-4 py-8'>
			<Button
				size='sm'
				className='absolute top-8 left-8 z-20 text-muted-foreground hover:text-foreground hover:opacity-100 bg-transparent border-none shadow-none transition-colors duration-200'
				onClick={() => navigate("/")}
				variant='text'
			>
				<FaArrowLeft />
				{backToHome}
			</Button>

			<div className='w-full max-w-md rounded-2xl p-8'>
				<h1 className='text-3xl font-bold text-center mb-2 text-foreground'>
					{title}
				</h1>
				<p className='text-center text-muted-foreground mb-8'>
					{subtitle}
				</p>

				<form onSubmit={handleSubmit} className='space-y-6' noValidate>
					<div>
						<Input
							type='text'
							placeholder={usernamePlaceholder}
							value={loginData.username}
							onChange={(e) =>
								setLoginData({
									...loginData,
									username: e.target.value,
								})
							}
							required
							className='w-full'
						/>
					</div>

					<div>
						<Input
							type='password'
							placeholder={passwordPlaceholder}
							value={loginData.password}
							onChange={(e) =>
								setLoginData({
									...loginData,
									password: e.target.value,
								})
							}
							required
							className='w-full'
							showPassword={showPassword}
							onShowPasswordChange={setShowPassword}
						/>
					</div>

					<div className='flex items-center justify-between'>
						<label className='flex items-center gap-2 cursor-pointer'>
							<input
								type='checkbox'
								checked={rememberMe}
								onChange={(e) =>
									setRememberMe(e.target.checked)
								}
								className='w-4 h-4 text-primary border-border rounded focus:ring-primary'
							/>
							<span className='text-sm text-foreground'>
								{rememberMeText}
							</span>
						</label>
						<Link
							to='/forgot-password'
							className='text-sm text-primary hover:text-primary/80 hover:underline'
						>
							{forgotPassword}
						</Link>
					</div>

					<Button
						type='submit'
						loading={isLoading}
						className='w-full bg-foreground text-background hover:opacity-90 dark:bg-foreground dark:text-background'
						size='lg'
					>
						{submit}
					</Button>
				</form>

				<div className='mt-6 text-center'>
					<p className='text-sm text-muted-foreground'>
						{noAccount}{" "}
						<Link
							to='/register'
							className='text-primary hover:text-primary/80 font-semibold hover:underline'
						>
							{signUp}
						</Link>
					</p>
				</div>

				<div className='mt-6'>
					<div className='relative'>
						<div className='absolute inset-0 flex items-center'>
							<div className='w-full border-t border-border'></div>
						</div>
						<div className='relative flex justify-center text-sm'>
							<span className='px-2 bg-background text-muted-foreground'>
								{or}
							</span>
						</div>
					</div>

					<div className='mt-6 grid grid-cols-2 gap-4'>
						<Button
							type='button'
							variant='outline'
							className='w-full border-border hover:bg-muted flex items-center justify-center gap-2'
							onClick={() => handleSocialLogin("google")}
						>
							<FaGoogle className='w-5 h-5 text-red-500 dark:text-red-400' />
							<span>{google}</span>
						</Button>
						<Button
							type='button'
							variant='outline'
							className='w-full border-border hover:bg-muted flex items-center justify-center gap-2'
							onClick={() => handleSocialLogin("facebook")}
						>
							<FaFacebook className='w-5 h-5 text-blue-600 dark:text-blue-400' />
							<span>{facebook}</span>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};


export default SignInPage;
