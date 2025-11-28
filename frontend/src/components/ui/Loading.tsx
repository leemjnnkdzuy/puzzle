import React from "react";
import classNames from "classnames";
import type {LoadingProps} from "@/types/LoadingPropsType";

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
	({size}, ref) => {
		const style: React.CSSProperties = {};

		if (typeof size === "number" || typeof size === "string") {
			const sizeValue = typeof size === "number" ? `${size}px` : size;
			style.width = sizeValue;
			style.height = sizeValue;
			style.minHeight = sizeValue;
		}

		const isSmall = typeof size === "boolean" && size;

		return (
			<div
				ref={ref}
				className={classNames(
					"relative text-transparent pointer-events-none",
					!isSmall && "min-h-[30px]"
				)}
				style={style}
			>
				<div
					className={classNames(
						"absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-solid animate-spin-loading",
						"border-t-transparent border-l-transparent",
						isSmall
							? "w-5 h-5 border-2"
							: "w-full h-full border-[3px]"
					)}
					style={{
						borderColor: "var(--text-primary)",
						width: "inherit",
						height: "inherit",
					}}
				/>
			</div>
		);
	}
);

Loading.displayName = "Loading";
export default Loading;
