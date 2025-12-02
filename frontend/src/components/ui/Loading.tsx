import React from "react";
import {Loader2} from "lucide-react";
import {cn} from "@/utils";

interface LoadingProps {
	size?: number | string | "sm" | "md" | "lg";
	className?: string;
	color?: string;
}

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
	({size, className, color}, ref) => {
		const colorStyle =
			color && (color.startsWith("#") || color.startsWith("rgb"))
				? {color}
				: undefined;
		const colorClass =
			color && !colorStyle
				? color
				: !colorStyle
				? "text-primary"
				: undefined;

		if (typeof size === "number") {
			return (
				<div ref={ref} className={cn("inline-block", className)}>
					<Loader2
						className={cn("animate-spin", colorClass)}
						style={{
							width: `${size}px`,
							height: `${size}px`,
							...colorStyle,
						}}
					/>
				</div>
			);
		}

		let sizeClass = "w-5 h-5";
		if (typeof size === "string") {
			if (size === "sm") {
				sizeClass = "w-4 h-4";
			} else if (size === "md") {
				sizeClass = "w-6 h-6";
			} else if (size === "lg") {
				sizeClass = "w-8 h-8";
			} else {
				sizeClass = size;
			}
		}

		return (
			<div ref={ref} className={cn("inline-block", className)}>
				<Loader2
					className={cn(sizeClass, "animate-spin", colorClass)}
					style={colorStyle}
				/>
			</div>
		);
	}
);

Loading.displayName = "Loading";
export default Loading;
