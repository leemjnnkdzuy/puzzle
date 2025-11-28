import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Loading from "@/components/ui/Loading";
import {useAuth} from "@/hooks/useAuth";
import authService from "@/services/AuthService";
import {useGlobalNotificationPopup} from "@/hooks/useGlobalNotificationPopup";
import type {
	RegisterData,
	LoginData,
	ForgotPasswordData,
} from "@/types/AuthTypes";

const HomePage: React.FC = () => {
	const navigate = useNavigate();
	const {user, isAuthenticated, loading, login, logout, refreshAccessToken} =
		useAuth();
	const {showError, showSuccess} = useGlobalNotificationPopup();

	// Form states
	const [activeForm, setActiveForm] = useState<
		"register" | "login" | "forgotPassword" | null
	>(null);
	const [isLoading, setIsLoading] = useState(false);

	// Register form
	const [registerData, setRegisterData] = useState<RegisterData>({
		first_name: "",
		last_name: "",
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	// Login form
	const [loginData, setLoginData] = useState<LoginData>({
		username: "",
		password: "",
	});

	// Forgot password form
	const [forgotPasswordData, setForgotPasswordData] =
		useState<ForgotPasswordData>({
			email: "",
		});

	const handleRegister = async () => {
		setIsLoading(true);
		try {
			const result = await authService.register(registerData);
			if (result.success) {
				showSuccess("Đăng ký thành công! Vui lòng kiểm tra email.");
				setActiveForm(null);
				setRegisterData({
					first_name: "",
					last_name: "",
					username: "",
					email: "",
					password: "",
					confirmPassword: "",
				});
			} else {
				showError(result.message || "Đăng ký thất bại!");
			}
		} catch (error) {
			showError(
				error instanceof Error ? error.message : "Đăng ký thất bại!"
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleLogin = async () => {
		setIsLoading(true);
		try {
			const result = await login(loginData.username, loginData.password);
			if (result.success) {
				showSuccess("Đăng nhập thành công!");
				setActiveForm(null);
				setLoginData({username: "", password: ""});
			} else {
				showError(result.message || "Đăng nhập thất bại!");
			}
		} catch (error) {
			showError(
				error instanceof Error ? error.message : "Đăng nhập thất bại!"
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleForgotPassword = async () => {
		setIsLoading(true);
		try {
			const result = await authService.forgotPassword(forgotPasswordData);
			if (result.success) {
				showSuccess(
					result.message || "Mã reset đã được gửi đến email của bạn!"
				);
				setActiveForm(null);
				setForgotPasswordData({email: ""});
			} else {
				showError(result.message || "Gửi mã reset thất bại!");
			}
		} catch (error) {
			showError(
				error instanceof Error
					? error.message
					: "Gửi mã reset thất bại!"
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleGetCurrentUser = async () => {
		setIsLoading(true);
		try {
			const result = await authService.getCurrentUser();
			if (result.success && result.data?.user) {
				showSuccess("Lấy thông tin user thành công!");
				console.log("Current user:", result.data.user);
			} else {
				showError(result.message || "Không thể lấy thông tin user!");
			}
		} catch (error) {
			showError(
				error instanceof Error
					? error.message
					: "Không thể lấy thông tin user!"
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleRefreshToken = async () => {
		setIsLoading(true);
		try {
			const success = await refreshAccessToken();
			if (success) {
				showSuccess("Refresh token thành công!");
			} else {
				showError("Refresh token thất bại!");
			}
		} catch (error) {
			showError(
				error instanceof Error
					? error.message
					: "Refresh token thất bại!"
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleLogout = async () => {
		setIsLoading(true);
		try {
			await logout();
			showSuccess("Đăng xuất thành công!");
		} catch (error) {
			showError(
				error instanceof Error ? error.message : "Đăng xuất thất bại!"
			);
		} finally {
			setIsLoading(false);
		}
	};

	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<Loading size={40} color='rgb(17, 24, 39)' />
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gray-50 p-8'>
			<div className='max-w-4xl mx-auto'>
				<h1 className='text-3xl font-bold mb-8 text-center'>
					Test Authentication
				</h1>

				<div className='bg-white rounded-lg shadow-md p-6 mb-6'>
					<h2 className='text-xl font-semibold mb-4'>User Info</h2>
					{isAuthenticated && user ? (
						<div className='space-y-2'>
							<pre className='bg-gray-100 p-4 rounded overflow-auto text-sm'>
								{JSON.stringify(user, null, 2)}
							</pre>
						</div>
					) : (
						<p className='text-gray-500'>Chưa đăng nhập</p>
					)}
				</div>

				<div className='bg-white rounded-lg shadow-md p-6 mb-6'>
					<h2 className='text-xl font-semibold mb-4'>Actions</h2>
					<div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
						<Button
							onClick={() => setActiveForm("register")}
							variant='outline'
							className='w-full'
						>
							Register
						</Button>
						<Button
							onClick={() => setActiveForm("login")}
							variant='outline'
							className='w-full'
						>
							Login
						</Button>
						<Button
							onClick={() => setActiveForm("forgotPassword")}
							variant='outline'
							className='w-full'
						>
							Forgot Password
						</Button>
						<Button
							onClick={handleGetCurrentUser}
							variant='outline'
							className='w-full'
							disabled={isLoading}
						>
							Get Current User
						</Button>
						<Button
							onClick={handleRefreshToken}
							variant='outline'
							className='w-full'
							disabled={isLoading}
						>
							Refresh Token
						</Button>
						<Button
							onClick={handleLogout}
							variant='outline'
							className='w-full'
							disabled={isLoading || !isAuthenticated}
						>
							Logout
						</Button>
					</div>
				</div>

				{/* Forms */}
				{activeForm && (
					<div className='bg-white rounded-lg shadow-md p-6'>
						{activeForm === "register" && (
							<div className='space-y-4'>
								<h2 className='text-xl font-semibold mb-4'>
									Register
								</h2>
								<div className='grid grid-cols-2 gap-4'>
									<Input
										placeholder='First Name'
										value={registerData.first_name}
										onChange={(e) =>
											setRegisterData({
												...registerData,
												first_name: e.target.value,
											})
										}
									/>
									<Input
										placeholder='Last Name'
										value={registerData.last_name}
										onChange={(e) =>
											setRegisterData({
												...registerData,
												last_name: e.target.value,
											})
										}
									/>
								</div>
								<Input
									placeholder='Username'
									value={registerData.username}
									onChange={(e) =>
										setRegisterData({
											...registerData,
											username:
												e.target.value.toLowerCase(),
										})
									}
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
								/>
								<Input
									type='password'
									placeholder='Password'
									value={registerData.password}
									onChange={(e) =>
										setRegisterData({
											...registerData,
											password: e.target.value,
										})
									}
								/>
								<Input
									type='password'
									placeholder='Confirm Password'
									value={registerData.confirmPassword}
									onChange={(e) =>
										setRegisterData({
											...registerData,
											confirmPassword: e.target.value,
										})
									}
								/>
								<div className='flex gap-4'>
									<Button
										onClick={handleRegister}
										loading={isLoading}
										className='flex-1'
									>
										Register
									</Button>
									<Button
										onClick={() => setActiveForm(null)}
										variant='outline'
										disabled={isLoading}
									>
										Cancel
									</Button>
								</div>
							</div>
						)}

						{activeForm === "login" && (
							<div className='space-y-4'>
								<h2 className='text-xl font-semibold mb-4'>
									Login
								</h2>
								<Input
									placeholder='Username or Email'
									value={loginData.username}
									onChange={(e) =>
										setLoginData({
											...loginData,
											username: e.target.value,
										})
									}
								/>
								<Input
									type='password'
									placeholder='Password'
									value={loginData.password}
									onChange={(e) =>
										setLoginData({
											...loginData,
											password: e.target.value,
										})
									}
								/>
								<div className='flex gap-4'>
									<Button
										onClick={handleLogin}
										loading={isLoading}
										className='flex-1'
									>
										Login
									</Button>
									<Button
										onClick={() => setActiveForm(null)}
										variant='outline'
										disabled={isLoading}
									>
										Cancel
									</Button>
								</div>
							</div>
						)}

						{activeForm === "forgotPassword" && (
							<div className='space-y-4'>
								<h2 className='text-xl font-semibold mb-4'>
									Forgot Password
								</h2>
								<Input
									type='email'
									placeholder='Email'
									value={forgotPasswordData.email}
									onChange={(e) =>
										setForgotPasswordData({
											email: e.target.value,
										})
									}
								/>
								<div className='flex gap-4'>
									<Button
										onClick={handleForgotPassword}
										loading={isLoading}
										className='flex-1'
									>
										Send Reset Code
									</Button>
									<Button
										onClick={() => setActiveForm(null)}
										variant='outline'
										disabled={isLoading}
									>
										Cancel
									</Button>
								</div>
							</div>
						)}
					</div>
				)}

				<div className='mt-6 text-center'>
					<Button
						onClick={() => navigate("/login")}
						variant='text'
						className='mr-4'
					>
						Go to Login Page
					</Button>
					<Button
						onClick={() => navigate("/register")}
						variant='text'
						className='mr-4'
					>
						Go to Register Page
					</Button>
					<Button
						onClick={() => navigate("/forgot-password")}
						variant='text'
					>
						Go to Forgot Password Page
					</Button>
				</div>
			</div>
		</div>
	);
};

HomePage.displayName = "HomePage";
export default HomePage;
