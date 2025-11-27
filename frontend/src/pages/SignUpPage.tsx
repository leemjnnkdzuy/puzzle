import React, {useState} from "react";
import {useNavigate, Link} from "react-router-dom";
import {FaArrowLeft} from "react-icons/fa";
import {Check, X} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Loading from "@/components/ui/Loading";
import Tooltip from "@/components/ui/Tooltip";
import authService from "@/services/AuthService";
import {useGlobalNotificationPopup} from "@/hooks/useGlobalNotificationPopup";
import {
	calculatePasswordStrength,
	getPasswordRules,
	getPasswordStrengthColor,
	validateRegister,
} from "@/utils/utils";
import type {RegisterData} from "@/types/AuthTypes";

const SignUpPage: React.FC = () => {
	const navigate = useNavigate();
	const {showError, showSuccess} = useGlobalNotificationPopup();
	const [registerData, setRegisterData] = useState<RegisterData>({
		first_name: "",
		last_name: "",
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [passwordFocused, setPasswordFocused] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const password = registerData.password || "";
	const score = calculatePasswordStrength(password);
	const dotColor = getPasswordStrengthColor(score);
	const rules = getPasswordRules(password);

	const renderPasswordRequirements = () => (
		<div className='min-w-[180px]'>
			<div className='font-semibold mb-1'>Yêu cầu mật khẩu:</div>
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
		const errorMsg = validateRegister(registerData);
		if (errorMsg) {
			showError(errorMsg);
			return;
		}

		setIsLoading(true);
		try {
			await authService.register(registerData);
			showSuccess("Đăng ký thành công! Vui lòng xác minh email của bạn.");
			setTimeout(() => {
				navigate("/verification");
			}, 1000);
		} catch (error) {
			showError(
				error instanceof Error ? error.message : "Đăng ký thất bại!"
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
					Đăng ký
				</h1>
				<p className='text-center text-gray-600 mb-8'>
					Tạo tài khoản mới để bắt đầu
				</p>

				<form onSubmit={handleSubmit} className='space-y-4' noValidate>
					<div className='flex gap-4'>
						<Input
							type='text'
							placeholder='Họ'
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
							placeholder='Tên'
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
						placeholder='Tên người dùng'
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
						placeholder='Email'
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
							placeholder='Mật khẩu'
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
						placeholder='Xác nhận mật khẩu'
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
						disabled={isLoading || score < 3}
						className='w-full bg-black text-white hover:bg-gray-800'
						size='lg'
					>
						{isLoading ? <Loading size='20px' /> : "Đăng ký"}
					</Button>
				</form>

				<div className='mt-6 text-center'>
					<p className='text-sm text-gray-600'>
						Đã có tài khoản?{" "}
						<Link
							to='/login'
							className='text-blue-600 hover:text-blue-800 font-semibold hover:underline'
						>
							Đăng nhập
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
};

SignUpPage.displayName = "SignUpPage";
export default SignUpPage;
