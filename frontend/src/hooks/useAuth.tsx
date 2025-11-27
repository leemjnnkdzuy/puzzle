import {useState, useCallback} from "react";
import axios from "axios";
import {DEFAULT_API_URL} from "../configs/AppConfig";
import type {LoginResponse} from "../types/AuthTypes";

interface UseAuthReturn {
	login: (username: string, password: string) => Promise<LoginResponse>;
	logout: () => void;
	isAuthenticated: boolean;
	token: string | null;
}

export const useAuth = (): UseAuthReturn => {
	const [token, setToken] = useState<string | null>(() => {
		return localStorage.getItem("token");
	});

	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
		return !!localStorage.getItem("token");
	});

	const login = useCallback(
		async (
			username: string,
			password: string
		): Promise<LoginResponse> => {
			try {
				const response = await axios.post<LoginResponse>(
					`${DEFAULT_API_URL}/api/auth/login`,
					{
						username,
						password,
					}
				);

				if (response.data.success && response.data.token) {
					const authToken = response.data.token;
					localStorage.setItem("token", authToken);
					setToken(authToken);
					setIsAuthenticated(true);
				}

				return response.data;
			} catch (error) {
				if (axios.isAxiosError(error)) {
					const message =
						error.response?.data?.message ||
						error.message ||
						"Đăng nhập thất bại!";
					return {
						success: false,
						message,
					};
				}
				return {
					success: false,
					message: "Đăng nhập thất bại!",
				};
			}
		},
		[]
	);

	const logout = useCallback(() => {
		localStorage.removeItem("token");
		setToken(null);
		setIsAuthenticated(false);
	}, []);

	return {
		login,
		logout,
		isAuthenticated,
		token,
	};
};

