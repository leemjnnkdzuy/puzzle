import React, {useEffect} from "react";

interface OverlayProps {
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
	backdropClassName?: string;
	contentClassName?: string;
	closeOnBackdropClick?: boolean;
}

const Overlay: React.FC<OverlayProps> = ({
	isOpen,
	onClose,
	children,
	backdropClassName = "",
	contentClassName = "",
	closeOnBackdropClick = true,
}) => {
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}

		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	if (!isOpen) return null;

	const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (closeOnBackdropClick && e.target === e.currentTarget) {
			onClose();
		}
	};

	return (
		<div
			className='fixed inset-0 z-[9999] flex items-center justify-center p-4'
			onClick={handleBackdropClick}
		>
			<div
				className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 shadow-[0_0_100px_rgba(0,0,0,0.5)] ${backdropClassName}`}
			/>

			<div
				className={`relative z-10 w-full max-w-md bg-card border border-border rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3),0_0_0_1px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)] animate-overlay-fade-in ${contentClassName}`}
				onClick={(e) => e.stopPropagation()}
			>
				{children}
			</div>
		</div>
	);
};

Overlay.displayName = "Overlay";
export default Overlay;

