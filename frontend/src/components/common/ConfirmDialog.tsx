import React from "react";
import {AlertTriangle, X, Home, FolderOpen} from "lucide-react";
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
	onSaveAndGoHome?: () => void | Promise<void>;
	onSaveAndSwitchProject?: () => void | Promise<void>;
	saveAndGoHomeText?: string;
	saveAndSwitchProjectText?: string;
	showDualActions?: boolean;
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
	onSaveAndGoHome,
	onSaveAndSwitchProject,
	saveAndGoHomeText = "Lưu và trở về trang chủ",
	saveAndSwitchProjectText = "Lưu và chuyển sang project",
	showDualActions = false,
}) => {
	const [isSaving, setIsSaving] = React.useState(false);

	const handleConfirm = async () => {
		await onConfirm();
	};

	const handleSaveAndGoHome = async () => {
		if (onSaveAndGoHome) {
			try {
				setIsSaving(true);
				await onSaveAndGoHome();
			} catch (error) {
				console.error("Failed to save and go home:", error);
				throw error;
			} finally {
				setIsSaving(false);
			}
		}
	};

	const handleSaveAndSwitchProject = async () => {
		if (onSaveAndSwitchProject) {
			try {
				setIsSaving(true);
				await onSaveAndSwitchProject();
			} catch (error) {
				console.error("Failed to save and switch project:", error);
				throw error;
			} finally {
				setIsSaving(false);
			}
		}
	};

	const isLoadingState = isLoading || isSaving;

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
			closeOnBackdropClick={!isLoadingState}
		>
			<div className='p-6 space-y-4'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-3'>
						{getIconVariant()}
						<h3 className='text-xl font-semibold text-foreground'>
							{title}
						</h3>
					</div>
					{!isLoadingState && (
						<button
							onClick={onClose}
							className='w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
							aria-label={cancelText}
						>
							<X className='w-5 h-5' />
						</button>
					)}
				</div>

				<p className='text-muted-foreground leading-relaxed break-words overflow-hidden'>
					{message}
				</p>

				{showDualActions &&
				(onSaveAndGoHome || onSaveAndSwitchProject) ? (
					<div className='flex flex-col gap-3 pt-2'>
						<Button
							variant='outline'
							onClick={onClose}
							disabled={isLoadingState}
							className='w-full'
						>
							{cancelText}
						</Button>
						{onSaveAndGoHome && (
							<Button
								variant='default'
								onClick={handleSaveAndGoHome}
								loading={isSaving || isLoading}
								disabled={isSaving || isLoading}
								className='w-full flex items-center justify-center gap-2'
							>
								<Home className='w-4 h-4' />
								{saveAndGoHomeText}
							</Button>
						)}
						{onSaveAndSwitchProject && (
							<Button
								variant='default'
								onClick={handleSaveAndSwitchProject}
								loading={isSaving}
								disabled={isLoadingState}
								className='w-full flex items-center justify-center gap-2'
							>
								<FolderOpen className='w-4 h-4' />
								{saveAndSwitchProjectText}
							</Button>
						)}
					</div>
				) : (
					<div className='flex items-center gap-3 pt-2'>
						<Button
							variant='outline'
							onClick={onClose}
							disabled={isLoadingState}
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
							disabled={isLoadingState}
							className={getButtonClassName()}
						>
							{confirmText}
						</Button>
					</div>
				)}
			</div>
		</Overlay>
	);
};


export default ConfirmDialog;
