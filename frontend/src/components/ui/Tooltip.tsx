import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type React from "react";
import {cn} from "@/utils";

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

const themeClasses: Record<string, string> = {
	light: "bg-white text-gray-900 shadow-lg border border-gray-300 backdrop-blur-sm",
	dark: "bg-gray-900 text-white shadow-xl border border-gray-800/50 backdrop-blur-sm",
};

const Tooltip = ({
	content,
	children,
	placement = "top",
	theme = "light",
	arrow = true,
	plain = false,
	className = "",
	delay,
	offset,
	...rest
}: TooltipProps) => {
	const themeKey = Object.prototype.hasOwnProperty.call(themeClasses, theme)
		? theme
		: "light";
	const baseClasses = plain
		? "px-3 py-1.5 rounded-lg bg-white text-sm font-medium shadow-md border border-gray-300"
		: `rounded-xl px-3 py-2 text-sm font-medium leading-relaxed ${themeClasses[themeKey]}`;
	const boxClasses = cn(baseClasses, className);
	const textClass = plain
		? "text-gray-900"
		: themeKey === "light"
		? "text-gray-900"
		: "text-white";

	const sideMap: Record<string, "top" | "bottom" | "left" | "right"> = {
		top: "top",
		bottom: "bottom",
		left: "left",
		right: "right",
	};

	const side = sideMap[placement] || "top";

	const delayDuration = Array.isArray(delay) ? delay[0] : delay || 100;

	const sideOffset = offset ? offset[1] || 8 : 8;

	const getAnimationClasses = () => {
		const baseAnimations = [
			"opacity-0 data-[state=delayed-open]:opacity-100",
			"scale-95 data-[state=delayed-open]:scale-100",
			"transition-all duration-200 ease-out",
			"will-change-[transform,opacity]",
		];

		if (plain) {
			return baseAnimations;
		}

		switch (side) {
			case "top":
				return [
					...baseAnimations,
					"translate-y-1 data-[state=delayed-open]:translate-y-0",
				];
			case "bottom":
				return [
					...baseAnimations,
					"-translate-y-1 data-[state=delayed-open]:translate-y-0",
				];
			case "left":
				return [
					...baseAnimations,
					"translate-x-1 data-[state=delayed-open]:translate-x-0",
				];
			case "right":
				return [
					...baseAnimations,
					"-translate-x-1 data-[state=delayed-open]:translate-x-0",
				];
			default:
				return baseAnimations;
		}
	};

	return (
		<TooltipPrimitive.Provider delayDuration={delayDuration}>
			<TooltipPrimitive.Root>
				<TooltipPrimitive.Trigger asChild>
					{children}
				</TooltipPrimitive.Trigger>
				<TooltipPrimitive.Portal>
					<TooltipPrimitive.Content
						side={side}
						sideOffset={sideOffset}
						className={cn(
							"z-[9999] max-w-xs",
							...getAnimationClasses(),
							boxClasses,
							textClass
						)}
						{...rest}
					>
						{content}
						{arrow && (
							<TooltipPrimitive.Arrow
								className={cn(
									"fill-current drop-shadow-sm",
									plain
										? "text-white stroke-gray-300 stroke-[0.5]"
										: themeKey === "light"
										? "text-white stroke-gray-300 stroke-[0.5]"
										: "text-gray-900 stroke-gray-800/50 stroke-[0.5]"
								)}
								width={12}
								height={6}
							/>
						)}
					</TooltipPrimitive.Content>
				</TooltipPrimitive.Portal>
			</TooltipPrimitive.Root>
		</TooltipPrimitive.Provider>
	);
};

export default Tooltip;
