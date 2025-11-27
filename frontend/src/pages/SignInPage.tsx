import React, {useState, useEffect} from "react";
import {useNavigate, Link} from "react-router-dom";
import {FaArrowLeft, FaGoogle, FaFacebook} from "react-icons/fa";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Loading from "@/components/ui/Loading";
import {useAuth} from "@/hooks/useAuth";
import {useGlobalNotificationPopup} from "@/hooks/useGlobalNotificationPopup";
import {useSocialLogin} from "@/hooks/useSocialLogin";
import type {LoginData} from "@/types/AuthTypes";

const SignInPage: React.FC = () => {
	const navigate = useNavigate();
	const {login, isAuthenticated} = useAuth();
	const {showError, showSuccess} = useGlobalNotificationPopup();
	const {handleSocialLogin} = useSocialLogin();
	const [loginData, setLoginData] = useState<LoginData>({
		username: "",
		password: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (isAuthenticated) {
			navigate("/");
		}
	}, [isAuthenticated, navigate]);

	const validateLogin = (data: LoginData): string | null => {
		if (!data.username || data.username.trim().length === 0) {
			return "Vui lòng nhập tên đăng nhập.";
		}
		if (!data.password || data.password.length === 0) {
			return "Vui lòng nhập mật khẩu.";
		}
		return null;
	};

	const handleBlur = (field: keyof LoginData) => {
		const errorMsg = validateLogin(loginData);
		if (errorMsg && loginData[field]) {
			showError(errorMsg);
		}
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
			if (result && result.success) {
				showSuccess("Đăng nhập thành công!");
				setTimeout(() => {
					navigate("/");
				}, 500);
			} else {
				showError(result?.message || "Đăng nhập thất bại!");
			}
		} catch (error) {
			showError(
				error instanceof Error ? error.message : "Đăng nhập thất bại!"
			);
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
				Trở về trang chủ
			</Button>

			<div className='w-full max-w-md bg-white rounded-2xl shadow-lg p-8'>
				<h1 className='text-3xl font-bold text-center mb-2 text-gray-900'>
					Đăng nhập
				</h1>
				<p className='text-center text-gray-600 mb-8'>
					Chào mừng trở lại!
				</p>

				<form onSubmit={handleSubmit} className='space-y-6' noValidate>
					<div>
						<Input
							type='text'
							placeholder='Tên đăng nhập'
							value={loginData.username}
							onChange={(e) =>
								setLoginData({
									...loginData,
									username: e.target.value,
								})
							}
							onBlur={() => handleBlur("username")}
							required
							className='w-full'
						/>
					</div>

					<div>
						<Input
							type='password'
							placeholder='Mật khẩu'
							value={loginData.password}
							onChange={(e) =>
								setLoginData({
									...loginData,
									password: e.target.value,
								})
							}
							onBlur={() => handleBlur("password")}
							required
							className='w-full'
							showPassword={showPassword}
							onShowPasswordChange={setShowPassword}
						/>
					</div>

					<div className='flex items-center justify-between'>
						<Link
							to='/forgot-password'
							className='text-sm text-blue-600 hover:text-blue-800 hover:underline'
						>
							Quên mật khẩu?
						</Link>
					</div>

					<Button
						type='submit'
						disabled={isLoading}
						className='w-full bg-black text-white hover:bg-gray-800'
						size='lg'
					>
						{isLoading ? <Loading size='20px' /> : "Đăng nhập"}
					</Button>
				</form>

				<div className='mt-6 text-center'>
					<p className='text-sm text-gray-600'>
						Chưa có tài khoản?{" "}
						<Link
							to='/register'
							className='text-blue-600 hover:text-blue-800 font-semibold hover:underline'
						>
							Đăng ký
						</Link>
					</p>
				</div>

				<div className='mt-6'>
					<div className='relative'>
						<div className='absolute inset-0 flex items-center'>
							<div className='w-full border-t border-gray-300'></div>
						</div>
						<div className='relative flex justify-center text-sm'>
							<span className='px-2 bg-white text-gray-500'>
								hoặc
							</span>
						</div>
					</div>

					<div className='mt-6 grid grid-cols-2 gap-4'>
						<Button
							type='button'
							variant='outline'
							className='w-full border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2'
							onClick={() => handleSocialLogin("google")}
						>
							<FaGoogle className='w-5 h-5 text-red-500' />
							<span>Google</span>
						</Button>
						<Button
							type='button'
							variant='outline'
							className='w-full border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2'
							onClick={() => handleSocialLogin("facebook")}
						>
							<FaFacebook className='w-5 h-5 text-blue-600' />
							<span>Facebook</span>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

SignInPage.displayName = "SignInPage";
export default SignInPage;
