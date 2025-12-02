import React from "react";
import {AlertTriangle, X} from "lucide-react";
import Button from "@/components/ui/Button";
import Overlay from "@/components/ui/Overlay";

interface ConfirmDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void | Promise<void>;
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	confirmVariant?: "default" | "primary" | "destructive" | "outline";
	isLoading?: boolean;
	icon?: React.ReactNode;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	confirmText = "Confirm",
	cancelText = "Cancel",
	confirmVariant = "destructive",
	isLoading = false,
	icon,
}) => {
	const handleConfirm = async () => {
		await onConfirm();
	};

	const getIconVariant = () => {
		if (icon) return icon;
		if (confirmVariant === "destructive") {
			return (
				<div className='w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center'>
					<AlertTriangle className='w-6 h-6 text-destructive' />
				</div>
			);
		}
		return (
			<div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center'>
				<AlertTriangle className='w-6 h-6 text-primary' />
			</div>
		);
	};

	const getButtonClassName = () => {
		if (confirmVariant === "destructive") {
			return "flex-1 bg-destructive text-destructive-foreground hover:opacity-90";
		}
		return "flex-1";
	};

	return (
		<Overlay
			isOpen={isOpen}
			onClose={onClose}
			closeOnBackdropClick={!isLoading}
		>
			<div className='p-6 space-y-4'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-3'>
						{getIconVariant()}
						<h3 className='text-xl font-semibold text-foreground'>
							{title}
						</h3>
					</div>
					{!isLoading && (
						<button
							onClick={onClose}
							className='w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
							aria-label={cancelText}
						>
							<X className='w-5 h-5' />
						</button>
					)}
				</div>

				<p className='text-muted-foreground leading-relaxed'>
					{message}
				</p>

				<div className='flex items-center gap-3 pt-2'>
					<Button
						variant='outline'
						onClick={onClose}
						disabled={isLoading}
						className='flex-1'
					>
						{cancelText}
					</Button>
					<Button
						variant={
							confirmVariant === "destructive"
								? "default"
								: confirmVariant
						}
						onClick={handleConfirm}
						loading={isLoading}
						disabled={isLoading}
						className={getButtonClassName()}
					>
						{confirmText}
					</Button>
				</div>
			</div>
		</Overlay>
	);
};

ConfirmDialog.displayName = "ConfirmDialog";
export default ConfirmDialog;
