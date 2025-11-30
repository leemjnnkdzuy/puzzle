import React from "react";
import {useLanguage} from "@/hooks/useLanguage";
import Button from "@/components/ui/Button";
import Overlay from "@/components/ui/Overlay";
import {LogOut, X} from "lucide-react";

interface LogoutConfirmDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title?: string;
	message?: string;
	confirmText?: string;
	cancelText?: string;
}

const LogoutConfirmDialog: React.FC<LogoutConfirmDialogProps> = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	confirmText,
	cancelText,
}) => {
	const {getNested} = useLanguage();

	const defaultTitle = getNested?.("logout.confirmTitle") as string;
	const defaultMessage = getNested?.("logout.confirmMessage") as string;
	const defaultConfirmText = getNested?.("logout.confirm") as string;
	const defaultCancelText = getNested?.("logout.cancel") as string;

	const handleConfirm = () => {
		onConfirm();
		onClose();
	};

	return (
		<Overlay isOpen={isOpen} onClose={onClose}>
			<div className='p-6 space-y-4'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-3'>
						<div className='w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center'>
							<LogOut className='w-6 h-6 text-destructive' />
						</div>
						<h3 className='text-xl font-semibold text-foreground'>
							{title || defaultTitle}
						</h3>
					</div>
					<button
						onClick={onClose}
						className='w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
						aria-label={defaultCancelText || "Close"}
					>
						<X className='w-5 h-5' />
					</button>
				</div>

				<p className='text-muted-foreground leading-relaxed'>
					{message || defaultMessage}
				</p>

				<div className='flex items-center gap-3 pt-2'>
					<Button
						variant='outline'
						onClick={onClose}
						className='flex-1'
					>
						{cancelText || defaultCancelText}
					</Button>
					<Button
						variant='default'
						onClick={handleConfirm}
						className='flex-1 bg-destructive text-destructive-foreground hover:opacity-90'
					>
						{confirmText || defaultConfirmText}
					</Button>
				</div>
			</div>
		</Overlay>
	);
};

LogoutConfirmDialog.displayName = "LogoutConfirmDialog";
export default LogoutConfirmDialog;
