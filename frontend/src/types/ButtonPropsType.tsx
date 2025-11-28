import type React from "react";

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?:
		| "default"
		| "primary"
		| "primary-gradient"
		| "destructive"
		| "outline"
		| "secondary"
		| "text"
		| "link";
	size?: "default" | "sm" | "lg" | "icon";
	asChild?: boolean;
	loading?: boolean;
}
