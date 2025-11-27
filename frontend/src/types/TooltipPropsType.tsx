import type React from "react";

export interface TooltipProps {
	content: React.ReactNode;
	children: React.ReactElement;
	placement?: "top" | "bottom" | "left" | "right";
	theme?: "light" | "dark";
	arrow?: boolean;
	plain?: boolean;
	className?: string;
	delay?: number | [number, number];
	offset?: [number, number];
}
