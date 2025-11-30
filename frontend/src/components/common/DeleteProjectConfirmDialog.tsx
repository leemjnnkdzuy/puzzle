import React from "react";
import Button from "@/components/ui/Button";
import Overlay from "@/components/ui/Overlay";
import {Trash2, X} from "lucide-react";

interface DeleteProjectConfirmDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	projectTitle?: string;
	title?: string;
	message?: string;
	confirmText?: string;
	cancelText?: string;
}

const DeleteProjectConfirmDialog: React.FC<DeleteProjectConfirmDialogProps> = ({
	isOpen,
	onClose,
	onConfirm,
	projectTitle,
	title,
	message,
	confirmText,
	cancelText,
}) => {
	const handleConfirm = () => {
		onConfirm();
		onClose();
	};

	const defaultTitle = title || "Xóa dự án";
	const defaultMessage =
		message ||
		`Bạn có chắc chắn muốn xóa dự án "${
			projectTitle || "này"
		}"? Hành động này không thể hoàn tác.`;
	const defaultConfirmText = confirmText || "Xóa";
	const defaultCancelText = cancelText || "Hủy";

	return (
		<Overlay isOpen={isOpen} onClose={onClose}>
			<div className='p-6 space-y-4'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-3'>
						<div className='w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center'>
							<Trash2 className='w-6 h-6 text-destructive' />
						</div>
						<h3 className='text-xl font-semibold text-foreground'>
							{defaultTitle}
						</h3>
					</div>
					<button
						onClick={onClose}
						className='w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
						aria-label={defaultCancelText}
					>
						<X className='w-5 h-5' />
					</button>
				</div>

				<p className='text-muted-foreground leading-relaxed'>
					{defaultMessage}
				</p>

				<div className='flex items-center gap-3 pt-2'>
					<Button
						variant='outline'
						onClick={onClose}
						className='flex-1'
					>
						{defaultCancelText}
					</Button>
					<Button
						variant='default'
						onClick={handleConfirm}
						className='flex-1 bg-destructive text-destructive-foreground hover:opacity-90'
					>
						{defaultConfirmText}
					</Button>
				</div>
			</div>
		</Overlay>
	);
};

DeleteProjectConfirmDialog.displayName = "DeleteProjectConfirmDialog";
export default DeleteProjectConfirmDialog;
