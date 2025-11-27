import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type {TooltipProps} from "../../types/TooltipPropsType";
import {cn} from "../../utils/utils";

const themeClasses: Record<string, string> = {
	light: "bg-white text-[#222] shadow-[0_2px_16px_rgba(0,0,0,0.08)] border border-white",
	dark: "bg-[#222] text-white shadow-[0_2px_16px_rgba(0,0,0,0.2)] border border-[#222]",
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
		? "px-0 py-0 shadow-none border-none bg-transparent text-inherit"
		: `rounded-2xl text-sm leading-5 ${themeClasses[themeKey]}`;
	const boxClasses = cn(baseClasses, className);
	const textClass = plain
		? "text-inherit"
		: themeKey === "light"
		? "text-[#222]"
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
							"z-[9999] text-[13px] leading-6 font-normal",
							"opacity-0 data-[state=delayed-open]:opacity-100",
							"scale-95 data-[state=delayed-open]:scale-100",
							"transition-all duration-200 ease-out",
							boxClasses,
							textClass
						)}
						{...rest}
					>
						{content}
						{arrow && !plain && (
							<TooltipPrimitive.Arrow
								className={cn(
									"fill-current",
									themeKey === "light"
										? "text-white"
										: "text-[#222]"
								)}
								width={11}
								height={5}
							/>
						)}
					</TooltipPrimitive.Content>
				</TooltipPrimitive.Portal>
			</TooltipPrimitive.Root>
		</TooltipPrimitive.Provider>
	);
};

export default Tooltip;
