import React from "react";

interface LoadingProps {
	size?: number | string | boolean;
	color?: string;
}

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
	({size, color}, ref) => {
		let width = "40px";
		let height = "40px";
		let borderWidth = "3px";

		if (typeof size === "number") {
			width = `${size}px`;
			height = `${size}px`;
			borderWidth = size < 30 ? "2px" : "3px";
		} else if (typeof size === "string") {
			width = size;
			height = size;
			borderWidth = "3px";
		} else if (size === true) {
			width = "20px";
			height = "20px";
			borderWidth = "2px";
		}

		const borderColor = color || "rgb(17, 24, 39)";

		return (
			<div
				ref={ref}
				style={{
					display: "inline-block",
					width: width,
					height: height,
					minWidth: width,
					minHeight: height,
				}}
			>
				<div
					style={{
						width: "100%",
						height: "100%",
						border: `${borderWidth} solid transparent`,
						borderTopColor: borderColor,
						borderRightColor: borderColor,
						borderRadius: "50%",
						animation: "spin 0.8s linear infinite",
					}}
				/>
			</div>
		);
	}
);

Loading.displayName = "Loading";
export default Loading;
