import {clsx} from "clsx";
import type {ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";
import type {RegisterData} from "@/types/AuthTypes";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export interface PasswordRule {
	label: string;
	test: boolean;
}

export const calculatePasswordStrength = (pwd: string): number => {
	let strength = 0;
	if (pwd.length >= 6) strength++;
	if (/[A-Z]/.test(pwd)) strength++;
	if (/[a-z]/.test(pwd)) strength++;
	if (/[0-9]/.test(pwd)) strength++;
	if (/[^A-Za-z0-9]/.test(pwd)) strength++;
	return Math.min(strength, 4);
};

export const getPasswordRules = (
	password: string,
	t?: (key: string) => string
): PasswordRule[] => {
	const getLabel = (key: string, fallback: string) => {
		return t ? t(key) : fallback;
	};

	return [
		{
			label: getLabel(
				"signUp.passwordRules.minLength",
				"Ít nhất 6 ký tự"
			),
			test: password.length >= 6,
		},
		{
			label: getLabel("signUp.passwordRules.uppercase", "Có chữ hoa"),
			test: /[A-Z]/.test(password),
		},
		{
			label: getLabel("signUp.passwordRules.lowercase", "Có chữ thường"),
			test: /[a-z]/.test(password),
		},
		{
			label: getLabel("signUp.passwordRules.number", "Có số"),
			test: /[0-9]/.test(password),
		},
		{
			label: getLabel(
				"signUp.passwordRules.special",
				"Có ký tự đặc biệt"
			),
			test: /[^A-Za-z0-9]/.test(password),
		},
	];
};

export const getPasswordStrengthColor = (score: number): string => {
	const dotColors = ["#e74c3c", "#e67e22", "#f1c40f", "#2ecc71", "#27ae60"];
	return dotColors[score] || "#e74c3c";
};

export const validateRegisterField = (
	field: keyof RegisterData,
	value: string,
	password?: string,
	t?: (key: string) => string
): string | null => {
	const getError = (key: string, fallback: string) => {
		return t ? t(key) : fallback;
	};

	switch (field) {
		case "last_name":
			if (!value || value.trim().length < 2) {
				return getError(
					"signUp.errors.lastNameMin",
					"Họ phải có ít nhất 2 ký tự."
				);
			}
			break;
		case "first_name":
			if (!value || value.trim().length < 2) {
				return getError(
					"signUp.errors.firstNameMin",
					"Tên phải có ít nhất 2 ký tự."
				);
			}
			break;
		case "username":
			if (!value || value.length < 6) {
				return getError(
					"signUp.errors.usernameMin",
					"Tên người dùng phải có ít nhất 6 ký tự."
				);
			}
			if (!/^[a-z0-9_.-]+$/.test(value)) {
				return getError(
					"signUp.errors.usernameInvalid",
					"Tên người dùng chỉ được chứa các ký tự a-z, 0-9, dấu gạch dưới (_), gạch ngang (-) và dấu chấm (.)"
				);
			}
			break;
		case "email":
			if (!value || !/^\S+@\S+\.\S+$/.test(value)) {
				return getError(
					"signUp.errors.emailInvalid",
					"Email không hợp lệ. Vui lòng nhập đúng định dạng email."
				);
			}
			break;
		case "password":
			if (value) {
				const rules = getPasswordRules(value, t);
				for (const rule of rules) {
					if (!rule.test) {
						const errorKey = getError(
							"signUp.errors.passwordRule",
							"Mật khẩu: {rule}"
						);
						return errorKey.replace("{rule}", rule.label);
					}
				}
			}
			break;
		case "confirmPassword":
			if (value && password && value !== password) {
				return getError(
					"signUp.errors.passwordMismatch",
					"Mật khẩu không khớp!"
				);
			}
			break;
	}
	return null;
};

export const validateRegister = (
	data: RegisterData,
	t?: (key: string) => string
): string | null => {
	const getError = (key: string, fallback: string) => {
		return t ? t(key) : fallback;
	};

	if (!data.last_name || data.last_name.trim().length < 2) {
		return getError(
			"signUp.errors.lastNameMin",
			"Họ phải có ít nhất 2 ký tự."
		);
	}
	if (!data.first_name || data.first_name.trim().length < 2) {
		return getError(
			"signUp.errors.firstNameMin",
			"Tên phải có ít nhất 2 ký tự."
		);
	}
	if (!data.username || data.username.length < 6) {
		return getError(
			"signUp.errors.usernameMin",
			"Tên người dùng phải có ít nhất 6 ký tự."
		);
	}
	if (!/^[a-z0-9_.-]+$/.test(data.username)) {
		return getError(
			"signUp.errors.usernameInvalid",
			"Tên người dùng chỉ được chứa các ký tự a-z, 0-9, dấu gạch dưới (_), gạch ngang (-) và dấu chấm (.)"
		);
	}
	if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) {
		return getError(
			"signUp.errors.emailInvalidShort",
			"Email không hợp lệ."
		);
	}
	const passwordRules = getPasswordRules(data.password, t);
	for (const rule of passwordRules) {
		if (!rule.test) {
			const errorKey = getError(
				"signUp.errors.passwordRule",
				"Mật khẩu: {rule}"
			);
			return errorKey.replace("{rule}", rule.label);
		}
	}
	if (data.password !== data.confirmPassword) {
		return getError(
			"signUp.errors.passwordMismatch",
			"Mật khẩu không khớp!"
		);
	}
	return null;
};
