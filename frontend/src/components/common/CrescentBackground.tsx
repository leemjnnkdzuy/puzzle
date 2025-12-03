import React, {useState, useEffect} from "react";
import {useTheme} from "@/hooks/useTheme";

interface CrescentBackgroundProps {
	className?: string;
	intenseShadow?: boolean;
}

const CrescentBackground: React.FC<CrescentBackgroundProps> = ({
	className = "",
	intenseShadow = false,
}) => {
	const {isDark} = useTheme();
	const [animationValue, setAnimationValue] = useState(0);

	useEffect(() => {
		let animationFrameId: number;
		const startTime = Date.now();
		const duration = 4000;

		const animate = () => {
			const elapsed = Date.now() - startTime;
			const value =
				(Math.sin((elapsed / duration) * 2 * Math.PI) + 1) / 2;
			setAnimationValue(value);
			animationFrameId = requestAnimationFrame(animate);
		};

		animate();

		return () => {
			cancelAnimationFrame(animationFrameId);
		};
	}, []);

	const adjustColorBrightness = (hex: string, factor: number) => {
		const adjustment = (factor - 0.5) * 0.3;

		const r = parseInt(hex.slice(1, 3), 16);
		const g = parseInt(hex.slice(3, 5), 16);
		const b = parseInt(hex.slice(5, 7), 16);

		const newR = Math.max(0, Math.min(255, Math.round(r + r * adjustment)));
		const newG = Math.max(0, Math.min(255, Math.round(g + g * adjustment)));
		const newB = Math.max(0, Math.min(255, Math.round(b + b * adjustment)));

		return `#${newR.toString(16).padStart(2, "0")}${newG
			.toString(16)
			.padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
	};

	const baseGradientStart = "#22d3ee";
	const baseGradientEnd = "#3b82f6";

	const primaryGradientStart = adjustColorBrightness(
		baseGradientStart,
		animationValue
	);
	const primaryGradientEnd = adjustColorBrightness(
		baseGradientEnd,
		animationValue
	);

	const hexToRgba = (hex: string, alpha: number) => {
		const r = parseInt(hex.slice(1, 3), 16);
		const g = parseInt(hex.slice(3, 5), 16);
		const b = parseInt(hex.slice(5, 7), 16);
		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	};

	const centerOpacity = intenseShadow
		? isDark
			? 0.8
			: 0.4
		: isDark
		? 0.5
		: 0.25;

	return (
		<div
			className={`absolute pointer-events-none ${className}`}
			style={{
				width: "100%",
				maxWidth: "1400px",
				height: "400px",
				bottom: 0,
				left: "50%",
				transform: "translateX(-50%)",
				overflow: "visible",
			}}
		>
			<svg
				style={{
					position: "absolute",
					width: "100%",
					height: "100%",
					bottom: 0,
					left: 0,
					overflow: "visible",
				}}
				viewBox='0 0 1400 300'
				preserveAspectRatio='none'
			>
				<defs>
					<linearGradient
						id='primaryGradient'
						x1='0%'
						y1='0%'
						x2='100%'
						y2='0%'
					>
						<stop offset='0%' stopColor={primaryGradientStart} />
						<stop offset='100%' stopColor={primaryGradientEnd} />
					</linearGradient>

					<linearGradient
						id='strokeGradient'
						x1='0%'
						y1='0%'
						x2='100%'
						y2='0%'
					>
						<stop
							offset='0%'
							stopColor={primaryGradientStart}
							stopOpacity={isDark ? 0.15 : 0.08}
						/>
						<stop
							offset='20%'
							stopColor={primaryGradientStart}
							stopOpacity={isDark ? 0.2 : 0.1}
						/>
						<stop
							offset='50%'
							stopColor={primaryGradientEnd}
							stopOpacity={centerOpacity}
						/>
						<stop
							offset='80%'
							stopColor={primaryGradientEnd}
							stopOpacity={isDark ? 0.2 : 0.1}
						/>
						<stop
							offset='100%'
							stopColor={primaryGradientEnd}
							stopOpacity={isDark ? 0.15 : 0.08}
						/>
					</linearGradient>

					<linearGradient
						id='topLineGradient'
						x1='0%'
						y1='0%'
						x2='100%'
						y2='0%'
					>
						<stop
							offset='0%'
							stopColor={primaryGradientStart}
							stopOpacity='0'
						/>
						<stop
							offset='25%'
							stopColor={primaryGradientStart}
							stopOpacity={isDark ? 0.1 : 0.05}
						/>
						<stop
							offset='50%'
							stopColor={primaryGradientEnd}
							stopOpacity={centerOpacity}
						/>
						<stop
							offset='75%'
							stopColor={primaryGradientEnd}
							stopOpacity={isDark ? 0.1 : 0.05}
						/>
						<stop
							offset='100%'
							stopColor={primaryGradientEnd}
							stopOpacity='0'
						/>
					</linearGradient>

					<filter
						id='dropShadowTop'
						x='-50%'
						y='-150%'
						width='200%'
						height='300%'
					>
						<feGaussianBlur in='SourceGraphic' stdDeviation='25' />
						<feOffset dx='0' dy='-15' result='offsetblur' />
						<feComponentTransfer>
							<feFuncA type='linear' slope='0.7' />
						</feComponentTransfer>
						<feMerge>
							<feMergeNode />
							<feMergeNode in='SourceGraphic' />
						</feMerge>
					</filter>

					<filter
						id='softGlow'
						x='-50%'
						y='-200%'
						width='200%'
						height='400%'
					>
						<feGaussianBlur in='SourceGraphic' stdDeviation='40' />
						<feOffset dx='0' dy='-30' result='offsetblur' />
						<feComponentTransfer>
							<feFuncA type='linear' slope='0.4' />
						</feComponentTransfer>
					</filter>

					<filter
						id='strongCenterShadow'
						x='-50%'
						y='-200%'
						width='200%'
						height='400%'
					>
						<feGaussianBlur in='SourceGraphic' stdDeviation='35' />
						<feOffset dx='0' dy='-25' result='offsetblur' />
						<feComponentTransfer>
							<feFuncA type='linear' slope='0.9' />
						</feComponentTransfer>
					</filter>
				</defs>

				<path
					d='M 0 300 Q 700 130 1400 300'
					stroke='url(#strokeGradient)'
					strokeWidth='2'
					fill='none'
					opacity={1}
					filter='url(#dropShadowTop)'
					style={{
						transition:
							"opacity 0.3s ease-in-out, filter 0.3s ease-in-out",
					}}
				/>

				<path
					d='M 0 300 Q 700 130 1400 300'
					stroke='url(#strokeGradient)'
					strokeWidth='6'
					fill='none'
					opacity={1}
					filter='url(#softGlow)'
					style={{
						transition:
							"opacity 0.3s ease-in-out, filter 0.3s ease-in-out",
					}}
				/>

				<path
					d='M 0 300 Q 700 130 1400 300'
					stroke='url(#strokeGradient)'
					strokeWidth='10'
					fill='none'
					opacity={1}
					filter='url(#strongCenterShadow)'
					style={{
						transition:
							"opacity 0.3s ease-in-out, filter 0.3s ease-in-out",
					}}
				/>

				<path
					d='M 0 300 Q 700 130 1400 300'
					stroke={primaryGradientEnd}
					strokeWidth='15'
					fill='none'
					opacity={intenseShadow ? (isDark ? 0.3 : 0.15) : 0}
					style={{
						filter: "blur(45px)",
						transition: "opacity 0.4s ease-in-out",
					}}
				/>

				<path
					d='M 0 300 Q 700 120 1400 300'
					stroke={primaryGradientEnd}
					strokeWidth='12'
					fill='none'
					opacity={isDark ? 0.1 : 0.05}
					style={{
						filter: "blur(50px)",
					}}
				/>

				<path
					d='M 0 290 Q 700 120 1400 290'
					stroke='url(#topLineGradient)'
					strokeWidth='2'
					fill='none'
					opacity={1}
					filter='url(#dropShadowTop)'
					style={{
						transition:
							"opacity 0.3s ease-in-out, filter 0.3s ease-in-out",
					}}
				/>

				<path
					d='M 0 290 Q 700 120 1400 290'
					stroke='url(#topLineGradient)'
					strokeWidth='6'
					fill='none'
					opacity={1}
					filter='url(#softGlow)'
					style={{
						transition:
							"opacity 0.3s ease-in-out, filter 0.3s ease-in-out",
					}}
				/>

				<path
					d='M 0 290 Q 700 120 1400 290'
					stroke='url(#topLineGradient)'
					strokeWidth='10'
					fill='none'
					opacity={1}
					filter='url(#strongCenterShadow)'
					style={{
						transition:
							"opacity 0.3s ease-in-out, filter 0.3s ease-in-out",
					}}
				/>

				<path
					d='M 0 290 Q 700 120 1400 290'
					stroke={primaryGradientEnd}
					strokeWidth='15'
					fill='none'
					opacity={intenseShadow ? (isDark ? 0.3 : 0.15) : 0}
					style={{
						filter: "blur(45px)",
						transition: "opacity 0.4s ease-in-out",
					}}
				/>
			</svg>

			<div
				style={{
					position: "absolute",
					width: "100%",
					height: "150px",
					bottom: "100px",
					left: 0,
					background: `radial-gradient(ellipse 50% 100% at 50% 100%, 
						${primaryGradientStart} 0%, 
						${hexToRgba(primaryGradientEnd, 0.53)} 30%,
						${hexToRgba(primaryGradientEnd, 0.27)} 50%,
						transparent 70%)`,
					filter: "blur(40px)",
					opacity: isDark ? 0.2 : 0.1,
					transform: "scaleY(0.7)",
					transformOrigin: "bottom center",
				}}
			/>

			<div
				style={{
					position: "absolute",
					width: "100%",
					height: "120px",
					bottom: "110px",
					left: 0,
					background: `radial-gradient(ellipse 40% 100% at 50% 100%, 
						${primaryGradientEnd} 0%, 
						transparent 60%)`,
					filter: "blur(50px)",
					opacity: isDark ? 0.25 : 0.12,
					transform: "scaleY(0.6)",
					transformOrigin: "bottom center",
				}}
			/>
		</div>
	);
};

export default CrescentBackground;
