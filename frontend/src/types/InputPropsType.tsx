import type React from "react";

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	containerClassName?: string;
	showPassword?: boolean;
	onShowPasswordChange?: (show: boolean) => void;
	showClearIcon?: boolean;
	onClear?: () => void;
}
