import React, {useState, useEffect, useCallback, useRef, useMemo} from "react";

import {useParams, useNavigate} from "react-router-dom";
import {PanelGroup, Panel, PanelResizeHandle} from "react-resizable-panels";
import {
	Upload,
	Film,
	Settings2,
	FileText,
	Loader2,
	Clock,
	CheckCircle,
	XCircle,
	Play,
	Pause,
	Trash2,
	GripVertical,
	FileVideo,
	AlertCircle,
	X,
	Cloud,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Loading from "@/components/ui/Loading";
import Input from "@/components/ui/Input";
import Overlay from "@/components/ui/Overlay";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import VideoPlayerControls from "@/components/ui/VideoPlayerControls";

import ScriptGenerationService, {
	type ScriptGenerationProject,
	type VideoFile,
} from "@/services/ScriptGenerationService";
import StorageService from "@/services/StorageService";
import {useProjectLayoutContext} from "@/hooks/useProjectLayoutContext";
import {useLanguage} from "@/hooks/useLanguage";
import {useStorageStore} from "@/stores/storageStore";
import {useCreditStore} from "@/stores/creditStore";
import {apiConfig} from "@/configs/AppConfig";
import {cn, formatFileSize, formatDate, getVideoThumbnail} from "@/utils";

export interface GenerationSettings {
	tone?: string;
	style?: string;
	length?: string;
}

interface TabConfig {
	id: string;
	label: string;
	icon: React.ReactNode;
}

interface UploadingFile {
	id: string;
	file: File;
	progress: number;
	error?: string;
}

const UPGRADE_PACKAGES = [
	{amountGB: 1, label: "1 GB"},
	{amountGB: 2, label: "2 GB"},
	{amountGB: 5, label: "5 GB"},
	{amountGB: 10, label: "10 GB"},
];

const GenerationOptions: React.FC<{
	settings: GenerationSettings;
	onSettingsChange: (settings: GenerationSettings) => void;
	onGenerate?: () => void;
	isGenerating?: boolean;
}> = ({settings, onSettingsChange, onGenerate, isGenerating = false}) => {
	const {t} = useLanguage();

	const handleChange = (field: keyof GenerationSettings, value: string) => {
		onSettingsChange({
			...settings,
			[field]: value,
		});
	};

	return (
		<div className='h-full w-full flex flex-col overflow-hidden'>
			<div className='p-2'>
				<div className='flex items-center gap-2'>
					<h3 className='text-sm font-semibold text-foreground'>
						{(t("projectPage.generationOptions.title") as string) ||
							"Tùy chỉnh Generation"}
					</h3>
				</div>
			</div>

			<div className='flex-1 overflow-y-auto p-4 space-y-6'>
				<div className='space-y-2'>
					<label className='text-sm font-medium text-foreground'>
						{(t("projectPage.generationOptions.tone") as string) ||
							"Tone (Giọng điệu)"}
					</label>
					<Input
						type='text'
						value={settings.tone || ""}
						onChange={(e) => handleChange("tone", e.target.value)}
						placeholder={
							(t(
								"projectPage.generationOptions.tonePlaceholder"
							) as string) ||
							"Ví dụ: Chuyên nghiệp, Thân thiện, Hài hước..."
						}
						className='w-full'
					/>
					<p className='text-xs text-muted-foreground'>
						{(t(
							"projectPage.generationOptions.toneDescription"
						) as string) || "Xác định giọng điệu của script"}
					</p>
				</div>

				<div className='space-y-2'>
					<label className='text-sm font-medium text-foreground'>
						{(t("projectPage.generationOptions.style") as string) ||
							"Style (Phong cách)"}
					</label>
					<Input
						type='text'
						value={settings.style || ""}
						onChange={(e) => handleChange("style", e.target.value)}
						placeholder={
							(t(
								"projectPage.generationOptions.stylePlaceholder"
							) as string) ||
							"Ví dụ: Tóm tắt, Phân tích, Review..."
						}
						className='w-full'
					/>
					<p className='text-xs text-muted-foreground'>
						{(t(
							"projectPage.generationOptions.styleDescription"
						) as string) || "Xác định phong cách viết script"}
					</p>
				</div>

				<div className='space-y-2'>
					<label className='text-sm font-medium text-foreground'>
						{(t(
							"projectPage.generationOptions.length"
						) as string) || "Length (Độ dài)"}
					</label>
					<Input
						type='text'
						value={settings.length || ""}
						onChange={(e) => handleChange("length", e.target.value)}
						placeholder={
							(t(
								"projectPage.generationOptions.lengthPlaceholder"
							) as string) || "Ví dụ: Ngắn, Trung bình, Dài..."
						}
						className='w-full'
					/>
					<p className='text-xs text-muted-foreground'>
						{(t(
							"projectPage.generationOptions.lengthDescription"
						) as string) || "Xác định độ dài mong muốn của script"}
					</p>
				</div>

				{onGenerate && (
					<div className='pt-4 border-t border-border'>
						<Button
							variant='primary-gradient'
							className='w-full'
							onClick={onGenerate}
							loading={isGenerating}
							disabled={isGenerating}
						>
							{isGenerating
								? (t(
										"projectPage.generationOptions.generating"
								  ) as string) || "Đang tạo script..."
								: (t(
										"projectPage.generationOptions.generate"
								  ) as string) || "Tạo Script"}
						</Button>
					</div>
				)}
			</div>
		</div>
	);
};

const ScriptReview: React.FC<{
	scriptContent?: string;
	status: "pending" | "processing" | "completed" | "failed";
}> = ({scriptContent, status}) => {
	const {t} = useLanguage();

	const getStatusIcon = () => {
		switch (status) {
			case "completed":
				return <CheckCircle className='w-4 h-4 text-green-500' />;
			case "failed":
				return <XCircle className='w-4 h-4 text-red-500' />;
			case "processing":
				return (
					<Loader2 className='w-4 h-4 text-blue-500 animate-spin' />
				);
			default:
				return <Clock className='w-4 h-4 text-yellow-500' />;
		}
	};

	const getStatusText = () => {
		switch (status) {
			case "completed":
				return (
					(t("projectPage.status.completed") as string) ||
					"Hoàn thành"
				);
			case "failed":
				return (t("projectPage.status.failed") as string) || "Thất bại";
			case "processing":
				return (
					(t("projectPage.status.processing") as string) ||
					"Đang xử lý"
				);
			default:
				return (
					(t("projectPage.status.pending") as string) || "Chờ xử lý"
				);
		}
	};

	return (
		<div className='h-full w-full flex flex-col overflow-hidden'>
			<div className='p-2'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<h3 className='text-sm font-semibold text-foreground'>
							Review Script
						</h3>
					</div>
					<div className='flex items-center gap-2'>
						{getStatusIcon()}
						<span className='text-xs font-medium text-foreground'>
							{getStatusText()}
						</span>
					</div>
				</div>
			</div>

			<div className='flex-1 overflow-y-auto p-6'>
				{status === "processing" && (
					<div className='flex items-center justify-center min-h-[200px]'>
						<div className='text-center'>
							<Loading size='lg' />
							<p className='text-muted-foreground mt-4'>
								Đang tạo script, vui lòng đợi...
							</p>
						</div>
					</div>
				)}

				{status === "pending" && !scriptContent && (
					<div className='flex items-center justify-center min-h-[200px]'>
						<div className='text-center'>
							<Clock className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
							<p className='text-muted-foreground'>
								Dự án đang chờ xử lý. Script sẽ được tạo tự
								động.
							</p>
						</div>
					</div>
				)}

				{status === "failed" && (
					<div className='flex items-center justify-center min-h-[200px]'>
						<div className='text-center'>
							<XCircle className='w-12 h-12 text-red-500 mx-auto mb-4' />
							<p className='text-red-500 font-medium mb-2'>
								Không thể tạo script
							</p>
							<p className='text-muted-foreground text-sm'>
								Vui lòng thử lại hoặc liên hệ hỗ trợ.
							</p>
						</div>
					</div>
				)}

				{scriptContent && (
					<div className='bg-card border border-border rounded-lg p-6'>
						<div className='prose dark:prose-invert max-w-none'>
							<p className='text-foreground whitespace-pre-wrap leading-relaxed'>
								{scriptContent}
							</p>
						</div>
					</div>
				)}

				{status === "completed" && !scriptContent && (
					<div className='flex items-center justify-center min-h-[200px]'>
						<div className='text-center'>
							<CheckCircle className='w-12 h-12 text-green-500 mx-auto mb-4' />
							<p className='text-muted-foreground'>
								Script đã được tạo nhưng chưa có nội dung.
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

const VideoThumbnail: React.FC<{
	video: VideoFile;
	projectId: string;
	isSelected: boolean;
	isHovered: boolean;
	isPlaying?: boolean;
}> = ({video, projectId, isSelected, isHovered, isPlaying = false}) => {
	const [thumbnail, setThumbnail] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;
		const fetchThumbnail = async () => {
			try {
				const token = await ScriptGenerationService.getVideoToken(
					projectId,
					video.filename
				);
				const videoUrl = `${apiConfig.apiBaseUrl}/script-generation/${projectId}/videos/${video.filename}?drm_token=${token}`;
				const thumb = await getVideoThumbnail(videoUrl);
				if (isMounted) setThumbnail(thumb);
			} catch (error) {
				// Fail silently
			}
		};

		if (projectId && video.filename) {
			fetchThumbnail();
		}
		return () => {
			isMounted = false;
		};
	}, [projectId, video.filename]);

	if (thumbnail) {
		return (
			<div className='relative w-12 h-12 flex-shrink-0 group rounded-lg overflow-hidden'>
				<img
					src={thumbnail}
					alt={video.originalName}
					className='w-full h-full object-cover'
				/>
				<div className='absolute inset-0 bg-black/30 flex items-center justify-center transition-colors group-hover:bg-black/70'>
					{isSelected && isPlaying ? (
						<Pause className='w-5 h-5 text-white' />
					) : (
						<Play className='w-5 h-5 text-white' />
					)}
				</div>
			</div>
		);
	}

	return (
		<div
			className={cn(
				"w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
				isSelected
					? "bg-primary/20 text-primary"
					: "bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
			)}
		>
			{isSelected && isPlaying ? (
				<Pause className='w-5 h-5' />
			) : isSelected || isHovered ? (
				<Play className='w-5 h-5' />
			) : (
				<FileVideo className='w-5 h-5' />
			)}
		</div>
	);
};

const ServerVideoList: React.FC<{
	videos: VideoFile[];
	selectedVideoFilename: string | null;
	onVideoSelect: (video: VideoFile) => void;
	onVideoDelete: (filename: string) => Promise<void>;
	onOrderChange?: (
		videos: {filename: string; order: number}[]
	) => Promise<void>;
	onVideosChange?: (videos: VideoFile[]) => void;
	onSavingChange?: (isSaving: boolean) => void;
	isLoading?: boolean;
	className?: string;
	projectId: string;
	isPlaying?: boolean;
}> = ({
	videos,
	selectedVideoFilename,
	onVideoSelect,
	onVideoDelete,
	onOrderChange,
	onVideosChange,
	onSavingChange,
	isLoading = false,
	className,
	projectId,
	isPlaying = false,
}) => {
	const {t} = useLanguage();
	const [deletingFilename, setDeletingFilename] = useState<string | null>(
		null
	);
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const [videoToDelete, setVideoToDelete] = useState<VideoFile | null>(null);
	const [hoveredFilename, setHoveredFilename] = useState<string | null>(null);

	const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
	const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
	const [isSavingOrder, setIsSavingOrder] = useState(false);
	const [localVideos, setLocalVideos] = useState<VideoFile[]>([]);
	const dragNodeRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const sorted = [...videos].sort((a, b) => a.order - b.order);
		setLocalVideos(sorted);
	}, [videos]);

	const handleDeleteClick = (e: React.MouseEvent, video: VideoFile) => {
		e.stopPropagation();
		setVideoToDelete(video);
		setDeleteConfirmOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!videoToDelete) return;

		setDeleteConfirmOpen(false);
		setDeletingFilename(videoToDelete.filename);

		try {
			await onVideoDelete(videoToDelete.filename);
		} catch (error) {
			console.error("Delete failed:", error);
		} finally {
			setDeletingFilename(null);
			setVideoToDelete(null);
		}
	};

	const handleCancelDelete = () => {
		setDeleteConfirmOpen(false);
		setVideoToDelete(null);
	};

	const handleDragStart = (
		e: React.DragEvent<HTMLDivElement>,
		index: number
	) => {
		setDraggedIndex(index);
		dragNodeRef.current = e.currentTarget;
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("text/plain", index.toString());
	};

	const handleDragEnd = () => {
		if (dragNodeRef.current) {
			dragNodeRef.current.style.opacity = "1";
		}
		setDraggedIndex(null);
		setDragOverIndex(null);
		dragNodeRef.current = null;
	};

	const handleDragOver = (
		e: React.DragEvent<HTMLDivElement>,
		index: number
	) => {
		e.preventDefault();
		e.stopPropagation();
		e.dataTransfer.dropEffect = "move";

		if (draggedIndex === null || draggedIndex === index) return;
		setDragOverIndex(index);
	};

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();

		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX;
		const y = e.clientY;
		if (
			x < rect.left ||
			x > rect.right ||
			y < rect.top ||
			y > rect.bottom
		) {
			setDragOverIndex(null);
		}
	};

	const handleDrop = async (
		e: React.DragEvent<HTMLDivElement>,
		dropIndex: number
	) => {
		e.preventDefault();
		e.stopPropagation();

		if (
			draggedIndex === null ||
			draggedIndex === dropIndex ||
			!onOrderChange
		) {
			handleDragEnd();
			return;
		}

		const newVideos = [...localVideos];
		const [draggedVideo] = newVideos.splice(draggedIndex, 1);
		newVideos.splice(dropIndex, 0, draggedVideo);

		const updatedVideos = newVideos.map((video, index) => ({
			...video,
			order: index + 1,
		}));

		setLocalVideos(updatedVideos);
		if (onVideosChange) {
			onVideosChange(updatedVideos);
		}

		handleDragEnd();

		const orderData = updatedVideos.map((video) => ({
			filename: video.filename,
			order: video.order,
		}));

		setIsSavingOrder(true);
		onSavingChange?.(true);
		try {
			await onOrderChange(orderData);
		} catch (error) {
			console.error("Failed to update order:", error);

			const sorted = [...videos].sort((a, b) => a.order - b.order);
			setLocalVideos(sorted);
			if (onVideosChange) {
				onVideosChange(sorted);
			}
		} finally {
			setIsSavingOrder(false);
			onSavingChange?.(false);
		}
	};

	if (isLoading) {
		return (
			<div className={cn("flex flex-col gap-2", className)}>
				{[1, 2, 3].map((i) => (
					<div
						key={i}
						className='h-16 rounded-lg bg-muted/50 animate-pulse'
					/>
				))}
			</div>
		);
	}

	if (localVideos.length === 0) {
		return (
			<div
				className={cn(
					"flex flex-col items-center justify-center py-12 text-center",
					className
				)}
			>
				<div className='w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4'>
					<FileVideo className='w-8 h-8 text-muted-foreground' />
				</div>
				<p className='text-muted-foreground font-medium'>
					{(t("projectPage.fileList.noVideos") as string) ||
						"Chưa có video nào"}
				</p>
				<p className='text-sm text-muted-foreground/70 mt-1'>
					{(t("projectPage.fileList.uploadToStart") as string) ||
						"Upload video để bắt đầu"}
				</p>
			</div>
		);
	}

	return (
		<div className={cn("flex flex-col gap-2 relative", className)}>
			{localVideos.map((video, index) => {
				const isSelected = selectedVideoFilename === video.filename;
				const isDeleting = deletingFilename === video.filename;
				const isHovered = hoveredFilename === video.filename;
				const isDragging = draggedIndex === index;
				const isDragOver = dragOverIndex === index;

				return (
					<div
						key={video.filename}
						draggable={!isDeleting && !isSavingOrder}
						onDragStart={(e) => handleDragStart(e, index)}
						onDragEnd={handleDragEnd}
						onDragOver={(e) => handleDragOver(e, index)}
						onDragLeave={handleDragLeave}
						onDrop={(e) => handleDrop(e, index)}
						className={cn(
							"relative group rounded-xl border transition-colors cursor-pointer overflow-hidden",
							isSelected
								? "border-primary bg-primary/5 shadow-md shadow-primary/10"
								: "border-border/60 hover:border-primary/40 hover:bg-accent/30",
							isDeleting && "opacity-50 pointer-events-none",
							isDragging && "opacity-40",
							isDragOver &&
								"border-primary border-2 bg-primary/10",
							isSavingOrder && "cursor-default"
						)}
						style={{
							transition: isDragging
								? "none"
								: "all 0.2s ease-in-out",
						}}
						onClick={() => !isSavingOrder && onVideoSelect(video)}
						onMouseEnter={() => setHoveredFilename(video.filename)}
						onMouseLeave={() => setHoveredFilename(null)}
					>
						{isDragOver &&
							draggedIndex !== null &&
							draggedIndex < index && (
								<div className='absolute -top-1 left-0 right-0 h-0.5 bg-primary rounded-full z-10' />
							)}
						{isDragOver &&
							draggedIndex !== null &&
							draggedIndex > index && (
								<div className='absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full z-10' />
							)}

						<div className='flex items-center gap-3 p-3'>
							<div
								className='flex items-center gap-1.5 flex-shrink-0 cursor-grab active:cursor-grabbing'
								onMouseDown={(e) => e.stopPropagation()}
							>
								<GripVertical
									className={cn(
										"w-4 h-4 transition-colors",
										isDragging
											? "text-primary"
											: "text-muted-foreground/50 hover:text-muted-foreground"
									)}
								/>
								<span className='text-xs font-medium text-muted-foreground w-5 text-center'>
									{index + 1}
								</span>
							</div>

							<VideoThumbnail
								video={video}
								projectId={projectId}
								isSelected={isSelected}
								isHovered={!!isHovered}
								isPlaying={isSelected && isPlaying}
							/>

							<div className='flex-1 min-w-0'>
								<p
									className={cn(
										"text-sm font-medium truncate transition-colors",
										isSelected
											? "text-primary"
											: "text-foreground"
									)}
									title={video.originalName}
								>
									{video.originalName}
								</p>
								<div className='flex items-center gap-3 mt-0.5'>
									<span className='text-xs text-muted-foreground'>
										{formatFileSize(video.size)}
									</span>
									<span className='text-xs text-muted-foreground flex items-center gap-1'>
										<Clock className='w-3 h-3' />
										{formatDate(video.uploadedAt)}
									</span>
								</div>
							</div>

							<div className='flex items-center gap-1 flex-shrink-0'>
								<Button
									variant='outline'
									size='icon'
									onClick={(e) => handleDeleteClick(e, video)}
									disabled={isDeleting || isSavingOrder}
									className={cn(
										"opacity-0 group-hover:opacity-100",
										"transition-all duration-200 ease-in-out",
										"hover:bg-destructive/10 hover:text-destructive hover:border-destructive",
										"active:scale-95"
									)}
									title='Xóa video'
								>
									{isDeleting ? (
										<div className='w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin' />
									) : (
										<Trash2 className='w-4 h-4' />
									)}
								</Button>
							</div>
						</div>

						{isSelected && (
							<div className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full' />
						)}
					</div>
				);
			})}

			<ConfirmDialog
				isOpen={deleteConfirmOpen}
				onClose={handleCancelDelete}
				onConfirm={handleConfirmDelete}
				title='Xóa video'
				message={
					videoToDelete
						? `Bạn có chắc chắn muốn xóa video "${videoToDelete.originalName}"? Hành động này không thể hoàn tác.`
						: "Bạn có chắc chắn muốn xóa video này?"
				}
				confirmText='Xóa'
				cancelText='Hủy'
				confirmVariant='destructive'
				isLoading={deletingFilename !== null}
			/>
		</div>
	);
};

const StreamingVideoPlayer: React.FC<{
	video: VideoFile | null;
	projectId: string;
	className?: string;
	videoMetadata?: VideoFile | null;
	onPlayingChange?: (isPlaying: boolean) => void;
}> = ({video, projectId, className, videoMetadata, onPlayingChange}) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const [videoSrc, setVideoSrc] = useState<string | null>(null);
	const [showSpinner, setShowSpinner] = useState(false);
	const spinnerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
		null
	);

	const clearSpinnerTimeout = useCallback(() => {
		if (spinnerTimeoutRef.current) {
			clearTimeout(spinnerTimeoutRef.current);
			spinnerTimeoutRef.current = null;
		}
	}, []);

	const showSpinnerDelayed = useCallback(() => {
		clearSpinnerTimeout();
		spinnerTimeoutRef.current = setTimeout(() => {
			setShowSpinner(true);
		}, 150);
	}, [clearSpinnerTimeout]);

	const hideSpinner = useCallback(() => {
		clearSpinnerTimeout();
		setShowSpinner(false);
	}, [clearSpinnerTimeout]);

	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		const onLoadStart = () => {
			showSpinnerDelayed();
		};

		const onCanPlay = () => {
			hideSpinner();
		};

		const onSeeking = () => {
			showSpinnerDelayed();
		};

		const onSeeked = () => {
			if (video.readyState >= 3) {
				hideSpinner();
			}
		};

		const onWaiting = () => {
			showSpinnerDelayed();
		};

		const onPlaying = () => {
			hideSpinner();
			onPlayingChange?.(true);
		};

		const onPause = () => {
			onPlayingChange?.(false);
		};

		const onTimeUpdate = () => {
			if (!video.seeking && video.readyState >= 3) {
				hideSpinner();
			}
		};

		video.addEventListener("loadstart", onLoadStart);
		video.addEventListener("canplay", onCanPlay);
		video.addEventListener("canplaythrough", onCanPlay);
		video.addEventListener("seeking", onSeeking);
		video.addEventListener("seeked", onSeeked);
		video.addEventListener("waiting", onWaiting);
		video.addEventListener("playing", onPlaying);
		video.addEventListener("pause", onPause);
		video.addEventListener("timeupdate", onTimeUpdate);

		return () => {
			clearSpinnerTimeout();
			video.removeEventListener("loadstart", onLoadStart);
			video.removeEventListener("canplay", onCanPlay);
			video.removeEventListener("canplaythrough", onCanPlay);
			video.removeEventListener("seeking", onSeeking);
			video.removeEventListener("seeked", onSeeked);
			video.removeEventListener("waiting", onWaiting);
			video.removeEventListener("playing", onPlaying);
			video.removeEventListener("pause", onPause);
			video.removeEventListener("timeupdate", onTimeUpdate);
		};
	}, [showSpinnerDelayed, hideSpinner, clearSpinnerTimeout]);

	useEffect(() => {
		const fetchToken = async () => {
			if (!video || !projectId) {
				setVideoSrc(null);
				return;
			}
			try {
				const token = await ScriptGenerationService.getVideoToken(
					projectId,
					video.filename
				);
				setVideoSrc(
					`${apiConfig.apiBaseUrl}/script-generation/${projectId}/videos/${video.filename}?drm_token=${token}`
				);
			} catch (err) {
				console.error("Failed to load video token", err);
				setVideoSrc(null);
			}
		};

		fetchToken();
	}, [video, projectId]);

	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		if (videoSrc) {
			setTimeout(() => {
				hideSpinner();
			}, 0);
			video.src = videoSrc;
			video.load();
		} else {
			setTimeout(() => {
				hideSpinner();
			}, 0);
			video.removeAttribute("src");
			video.load();
		}
	}, [videoSrc, hideSpinner]);

	useEffect(() => {
		return () => {
			clearSpinnerTimeout();
		};
	}, [clearSpinnerTimeout]);

	if (!videoSrc) {
		return (
			<div
				className={cn(
					"flex flex-col w-full h-full bg-black/5 rounded-xl overflow-hidden",
					className
				)}
			>
				<div className='flex-1 flex items-center justify-center'>
					<div className='text-center text-muted-foreground'>
						<Film className='w-16 h-16 mx-auto mb-4 opacity-30' />
						<p className='font-medium'>Chọn video để phát</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div
			className={cn(
				"flex flex-col w-full h-full bg-card rounded-xl overflow-hidden",
				className
			)}
		>
			<div className='flex-1 relative flex items-center justify-center bg-black min-h-0 overflow-hidden'>
				<video
					ref={videoRef}
					className='max-w-full max-h-full object-contain'
					playsInline
					preload='auto'
					crossOrigin='use-credentials'
				/>

				{showSpinner && (
					<div className='absolute inset-0 flex items-center justify-center bg-black/50 z-20'>
						<Loading size={48} />
					</div>
				)}
			</div>

			<VideoPlayerControls
				videoRef={videoRef}
				className='flex-shrink-0'
				videoMetadata={videoMetadata}
			/>
		</div>
	);
};

const VideoUploader: React.FC<{
	projectId: string;
	onUploadComplete: () => void;
	onUpload: (file: File, order: number) => Promise<void>;
	currentVideoCount: number;
	className?: string;
	onUploadingChange?: (isUploading: boolean) => void;
}> = ({
	onUploadComplete,
	onUpload,
	currentVideoCount,
	className,
	onUploadingChange,
}) => {
	const {t} = useLanguage();
	const [isDragging, setIsDragging] = useState(false);
	const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const {storageInfo} = useStorageStore();

	useEffect(() => {
		onUploadingChange?.(uploadingFiles.length > 0);
	}, [uploadingFiles.length, onUploadingChange]);

	const handleFileSelect = useCallback(
		async (files: FileList | File[] | null) => {
			if (!files || files.length === 0) return;

			const fileArray = Array.from(files).filter((file) =>
				file.type.startsWith("video/")
			);

			if (fileArray.length === 0) return;

			const totalSize = fileArray.reduce(
				(sum, file) => sum + file.size,
				0
			);
			const availableStorage = storageInfo?.available ?? 0;

			if (totalSize > availableStorage) {
				const errorMessage = (
					(t("projectPage.fileList.insufficientStorage") as string) ||
					"Không đủ dung lượng! Cần: {needed}, Còn lại: {available}. Vui lòng nâng cấp gói lưu trữ."
				)
					.replace("{needed}", formatFileSize(totalSize))
					.replace("{available}", formatFileSize(availableStorage));

				const errorFiles: UploadingFile[] = fileArray.map(
					(file, index) => ({
						id: `${Date.now()}-${index}`,
						file,
						progress: 0,
						error: errorMessage,
					})
				);

				setUploadingFiles((prev) => [...prev, ...errorFiles]);
				return;
			}

			const newUploadingFiles: UploadingFile[] = fileArray.map(
				(file, index) => ({
					id: `${Date.now()}-${index}`,
					file,
					progress: 0,
				})
			);

			setUploadingFiles((prev) => [...prev, ...newUploadingFiles]);

			for (let i = 0; i < newUploadingFiles.length; i++) {
				const uploadingFile = newUploadingFiles[i];
				const order = currentVideoCount + i + 1;

				try {
					const progressInterval = setInterval(() => {
						setUploadingFiles((prev) =>
							prev.map((f) =>
								f.id === uploadingFile.id && f.progress < 90
									? {...f, progress: f.progress + 10}
									: f
							)
						);
					}, 150);

					await onUpload(uploadingFile.file, order);

					clearInterval(progressInterval);

					setUploadingFiles((prev) =>
						prev.map((f) =>
							f.id === uploadingFile.id
								? {...f, progress: 100}
								: f
						)
					);

					setTimeout(() => {
						setUploadingFiles((prev) =>
							prev.filter((f) => f.id !== uploadingFile.id)
						);
					}, 500);
				} catch (error) {
					console.error("Upload failed:", error);
					setUploadingFiles((prev) =>
						prev.map((f) =>
							f.id === uploadingFile.id
								? {...f, error: "Upload failed"}
								: f
						)
					);
				}
			}

			onUploadComplete();
		},
		[onUpload, currentVideoCount, storageInfo, onUploadComplete]
	);

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
		handleFileSelect(e.dataTransfer.files);
	};

	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		handleFileSelect(e.target.files);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleRemoveError = (id: string) => {
		setUploadingFiles((prev) => prev.filter((f) => f.id !== id));
	};

	return (
		<div className={cn("flex flex-col gap-3", className)}>
			<div
				className={cn(
					"relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer group",
					isDragging
						? "border-primary bg-primary/5 scale-[1.02]"
						: "border-border/60 hover:border-primary/50 hover:bg-accent/30"
				)}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				onClick={() => fileInputRef.current?.click()}
			>
				<div className='flex flex-col items-center gap-3 pointer-events-none'>
					<div
						className={cn(
							"w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200",
							isDragging
								? "bg-primary/20 text-primary scale-110"
								: "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
						)}
					>
						<Upload className='w-7 h-7' />
					</div>
					<div className='text-center'>
						<p className='font-medium text-foreground'>
							{(t("projectPage.fileList.dragDrop") as string) ||
								"Kéo thả video vào đây"}
						</p>
						<p className='text-sm text-muted-foreground mt-1'>
							{(t("projectPage.fileList.orClick") as string) ||
								"hoặc nhấn để chọn file"}
						</p>
					</div>
				</div>
				<input
					ref={fileInputRef}
					type='file'
					accept='video/*'
					multiple
					onChange={handleFileInputChange}
					className='hidden'
				/>
			</div>

			{uploadingFiles.length > 0 && (
				<div className='space-y-2'>
					{uploadingFiles.map((uploadingFile) => (
						<div
							key={uploadingFile.id}
							className={cn(
								"relative rounded-lg border p-3 transition-all",
								uploadingFile.error
									? "border-destructive/50 bg-destructive/5"
									: "border-border bg-card"
							)}
						>
							<div className='flex items-center gap-3'>
								<div
									className={cn(
										"w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
										uploadingFile.error
											? "bg-destructive/10 text-destructive"
											: "bg-primary/10 text-primary"
									)}
								>
									{uploadingFile.error ? (
										<AlertCircle className='w-5 h-5' />
									) : (
										<FileVideo className='w-5 h-5' />
									)}
								</div>
								<div className='flex-1 min-w-0'>
									<p className='text-sm font-medium truncate'>
										{uploadingFile.file.name}
									</p>
									<p className='text-xs text-muted-foreground'>
										{formatFileSize(
											uploadingFile.file.size
										)}
									</p>
								</div>
								{uploadingFile.error && (
									<Button
										variant='text'
										size='icon'
										onClick={() =>
											handleRemoveError(uploadingFile.id)
										}
										className='flex-shrink-0'
									>
										<X className='w-4 h-4' />
									</Button>
								)}
							</div>

							{uploadingFile.error ? (
								<p className='text-xs text-destructive mt-2'>
									{uploadingFile.error}
								</p>
							) : (
								<div className='mt-2'>
									<div className='h-1.5 bg-muted rounded-full overflow-hidden'>
										<div
											className='h-full bg-primary transition-all duration-300 ease-out'
											style={{
												width: `${uploadingFile.progress}%`,
											}}
										/>
									</div>
									<p className='text-xs text-muted-foreground mt-1 text-right'>
										{uploadingFile.progress}%
									</p>
								</div>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

const StorageUpgradeOverlay: React.FC<{
	isOpen: boolean;
	onClose: () => void;
	onUpgradeSuccess?: () => void;
}> = ({isOpen, onClose, onUpgradeSuccess}) => {
	const [loading, setLoading] = useState(false);
	const [upgrading, setUpgrading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
	const {credit, fetchCredit} = useCreditStore();
	const {storageInfo, fetchStorageInfo} = useStorageStore();

	useEffect(() => {
		if (isOpen) {
			setLoading(true);
			fetchStorageInfo()
				.catch((err) => {
					const errorMessage =
						err instanceof Error
							? err.message
							: "Failed to load storage info";
					setError(errorMessage);
				})
				.finally(() => setLoading(false));
			fetchCredit();
		}
	}, [isOpen, fetchStorageInfo, fetchCredit]);

	const handleUpgrade = async () => {
		if (!selectedPackage || !storageInfo) return;

		const packageInfo = UPGRADE_PACKAGES.find(
			(pkg) => pkg.amountGB === selectedPackage
		);
		if (!packageInfo) return;

		if (credit < selectedPackage) {
			setError(
				`Insufficient credit. Required: ${selectedPackage}, Available: ${credit}`
			);
			return;
		}

		try {
			setUpgrading(true);
			setError(null);
			await StorageService.upgradeStorage(selectedPackage);
			await fetchStorageInfo();
			await fetchCredit();
			setSelectedPackage(null);
			onUpgradeSuccess?.();
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "Failed to upgrade storage";
			setError(errorMessage);
		} finally {
			setUpgrading(false);
		}
	};

	return (
		<Overlay isOpen={isOpen} onClose={onClose} contentClassName='max-w-lg'>
			<div className='p-6'>
				<div className='flex items-center justify-between mb-6'>
					<div className='flex items-center gap-3'>
						<div className='w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center'>
							<Cloud className='w-5 h-5 text-primary' />
						</div>
						<div>
							<h2 className='text-xl font-semibold text-foreground'>
								Nâng cấp Cloud Storage
							</h2>
							<p className='text-sm text-muted-foreground'>
								Sử dụng credit để tăng dung lượng
							</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className='w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
						aria-label='Đóng'
					>
						<X className='w-5 h-5' />
					</button>
				</div>

				{loading ? (
					<div className='flex items-center justify-center py-8'>
						<div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin' />
					</div>
				) : error && !storageInfo ? (
					<div className='bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4'>
						<div className='flex items-center gap-2 text-destructive'>
							<AlertCircle className='w-5 h-5' />
							<p className='text-sm'>{error}</p>
						</div>
					</div>
				) : (
					<>
						{storageInfo && (
							<div className='bg-muted/50 rounded-lg p-4 mb-6'>
								<div className='space-y-2'>
									<div className='flex items-center justify-between'>
										<span className='text-sm text-muted-foreground'>
											Dung lượng đã dùng:
										</span>
										<span className='text-sm font-medium text-foreground'>
											{storageInfo.usedFormatted}
										</span>
									</div>
									<div className='flex items-center justify-between'>
										<span className='text-sm text-muted-foreground'>
											Tổng dung lượng:
										</span>
										<span className='text-sm font-medium text-foreground'>
											{storageInfo.limitFormatted}
										</span>
									</div>
									<div className='flex items-center justify-between'>
										<span className='text-sm text-muted-foreground'>
											Còn lại:
										</span>
										<span className='text-sm font-medium text-primary'>
											{storageInfo.availableFormatted}
										</span>
									</div>
									<div className='flex items-center justify-between pt-2 border-t border-border'>
										<span className='text-sm text-muted-foreground'>
											Credit hiện tại:
										</span>
										<span className='text-sm font-medium text-foreground'>
											{credit.toLocaleString()}
										</span>
									</div>
								</div>
							</div>
						)}

						<div className='mb-6'>
							<h3 className='text-sm font-medium text-foreground mb-3'>
								Chọn gói nâng cấp (1GB = 1 credit):
							</h3>
							<div className='grid grid-cols-2 gap-3'>
								{UPGRADE_PACKAGES.map((pkg) => (
									<button
										key={pkg.amountGB}
										onClick={() =>
											setSelectedPackage(pkg.amountGB)
										}
										disabled={
											credit < pkg.amountGB || upgrading
										}
										className={`p-4 rounded-lg border-2 transition-all ${
											selectedPackage === pkg.amountGB
												? "border-primary bg-primary/10"
												: "border-border hover:border-primary/50"
										} ${
											credit < pkg.amountGB
												? "opacity-50 cursor-not-allowed"
												: "cursor-pointer"
										}`}
									>
										<div className='text-center'>
											<div className='text-lg font-semibold text-foreground mb-1'>
												{pkg.label}
											</div>
											<div className='text-xs text-muted-foreground'>
												{pkg.amountGB} credit
											</div>
										</div>
									</button>
								))}
							</div>
						</div>

						{error && (
							<div className='bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4'>
								<div className='flex items-center gap-2 text-destructive'>
									<AlertCircle className='w-4 h-4' />
									<p className='text-sm'>{error}</p>
								</div>
							</div>
						)}

						<div className='flex items-center gap-3'>
							<Button
								variant='outline'
								onClick={onClose}
								disabled={upgrading}
								className='flex-1'
							>
								Hủy
							</Button>
							<Button
								variant='primary-gradient'
								onClick={handleUpgrade}
								loading={upgrading}
								disabled={!selectedPackage || upgrading}
								className='flex-1'
							>
								Nâng cấp
							</Button>
						</div>
					</>
				)}
			</div>
		</Overlay>
	);
};

const ScriptGenerationServiceProjectPage: React.FC = () => {
	const {id} = useParams<{id: string}>();
	const navigate = useNavigate();
	const {
		setHasUnsavedChanges,
		setOnSave,
		scriptGenerationLayout: layout,
	} = useProjectLayoutContext();
	const {storageInfo, fetchStorageInfo} = useStorageStore();
	const {t} = useLanguage();

	const TABS: TabConfig[] = useMemo(
		() => [
			{
				id: "upload",
				label: (t("projectPage.tabs.upload") as string) || "Upload",
				icon: <Upload className='w-4 h-4' />,
			},
			{
				id: "videos",
				label: (t("projectPage.tabs.videos") as string) || "Videos",
				icon: <Film className='w-4 h-4' />,
			},
			{
				id: "settings",
				label: (t("projectPage.tabs.settings") as string) || "Cài đặt",
				icon: <Settings2 className='w-4 h-4' />,
			},
		],
		[]
	);

	const [project, setProject] = useState<ScriptGenerationProject | null>(
		null
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [hasChanges, setHasChanges] = useState(false);

	const [videos, setVideos] = useState<VideoFile[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	const [selectedVideo, setSelectedVideo] = useState<VideoFile | null>(null);
	const [videosLoading, setVideosLoading] = useState(false);
	const [isSavingOrder, setIsSavingOrder] = useState(false);
	const [generationSettings, setGenerationSettings] =
		useState<GenerationSettings>({});
	const [activeTab, setActiveTab] = useState("videos");
	const [storageOverlayOpen, setStorageOverlayOpen] = useState(false);
	const [showTabText, setShowTabText] = useState(true);
	const [isVideoPlaying, setIsVideoPlaying] = useState(false);

	const initialGenerationSettingsRef = React.useRef<GenerationSettings>({});
	const isInitialLoadRef = React.useRef(true);
	const panelRef = useRef<HTMLDivElement>(null);
	const handleSaveRef = React.useRef<(() => Promise<void>) | null>(null);

	const loadVideos = useCallback(async () => {
		if (!id) return;

		setVideosLoading(true);
		try {
			const uploadedVideos = await ScriptGenerationService.getVideos(id);
			setVideos(uploadedVideos);

			setSelectedVideo((prevSelected) => {
				if (uploadedVideos.length === 0) return null;
				if (!prevSelected) return uploadedVideos[0];

				const stillExists = uploadedVideos.find(
					(v) => v.filename === prevSelected.filename
				);
				if (!stillExists) return uploadedVideos[0];

				return prevSelected;
			});
		} catch (error) {
			console.error("Failed to load videos:", error);
		} finally {
			setVideosLoading(false);
		}
	}, [id]);

	const handleVideoUpload = useCallback(
		async (file: File, order: number) => {
			if (!id) return;

			await ScriptGenerationService.uploadVideo(id, file, order);
			await fetchStorageInfo();
		},
		[id, fetchStorageInfo]
	);

	const handleVideoDelete = useCallback(
		async (filename: string) => {
			if (!id) return;

			await ScriptGenerationService.deleteVideo(id, filename);
			await fetchStorageInfo();
			await loadVideos();
		},
		[id, fetchStorageInfo, loadVideos]
	);

	const handleOrderChange = useCallback(
		async (orderData: {filename: string; order: number}[]) => {
			if (!id) return;

			await ScriptGenerationService.updateVideoOrder(id, orderData);
		},
		[id]
	);

	const handleVideosChange = useCallback((updatedVideos: VideoFile[]) => {
		setVideos(updatedVideos);
	}, []);

	const handleSave = useCallback(async () => {
		if (!project || !id || isInitialLoadRef.current) return;

		try {
			const settingsChanged =
				JSON.stringify(generationSettings) !==
				JSON.stringify(initialGenerationSettingsRef.current);

			if (settingsChanged && Object.keys(generationSettings).length > 0) {
				await ScriptGenerationService.updateProject(id, {
					generationSettings,
				});
				initialGenerationSettingsRef.current = {...generationSettings};
			}

			queueMicrotask(() => {
				setHasChanges(false);
			});
		} catch (error) {
			console.error("Failed to save:", error);
			throw error;
		}
	}, [project, id, generationSettings]);

	React.useEffect(() => {
		handleSaveRef.current = handleSave;
	}, [handleSave]);

	useEffect(() => {
		const fetchProject = async () => {
			if (!id) return;

			try {
				setLoading(true);
				setError(null);
				const data = await ScriptGenerationService.getProjectById(id);
				setProject(data);

				if (data.generationSettings) {
					setGenerationSettings(data.generationSettings);
					initialGenerationSettingsRef.current =
						data.generationSettings;
				}
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Không thể tải dự án"
				);
			} finally {
				setLoading(false);
			}
		};

		fetchProject();
	}, [id]);

	useEffect(() => {
		if (project && id) {
			loadVideos();
			fetchStorageInfo();
		}

		setTimeout(() => {
			isInitialLoadRef.current = false;
		}, 100);
	}, [project, id, loadVideos, fetchStorageInfo]);

	useEffect(() => {
		queueMicrotask(() => {
			const hasSettingsChanges =
				Object.keys(generationSettings).length > 0;
			setHasChanges(hasSettingsChanges);
		});
	}, [generationSettings]);

	useEffect(() => {
		const stableSaveWrapper = async () => {
			if (handleSaveRef.current) {
				await handleSaveRef.current();
			}
		};

		queueMicrotask(() => {
			setOnSave(stableSaveWrapper);
		});

		return () => {
			queueMicrotask(() => {
				setOnSave(undefined);
				setHasUnsavedChanges(false);
			});
		};
	}, [setOnSave, setHasUnsavedChanges]);

	useEffect(() => {
		queueMicrotask(() => {
			setHasUnsavedChanges(hasChanges);
		});
	}, [hasChanges, setHasUnsavedChanges]);

	const updateShowText = useCallback(() => {
		const panel = panelRef.current;
		if (panel) {
			const width = panel.offsetWidth;
			setShowTabText(width >= 450);
		}
	}, []);

	const handlePanelResize = useCallback(() => {
		requestAnimationFrame(() => {
			updateShowText();
		});
	}, [updateShowText]);

	useEffect(() => {
		const panel = panelRef.current;
		if (!panel) return;

		updateShowText();

		const resizeObserver = new ResizeObserver(() => {
			updateShowText();
		});

		resizeObserver.observe(panel);

		window.addEventListener("resize", updateShowText);

		return () => {
			resizeObserver.disconnect();
			window.removeEventListener("resize", updateShowText);
		};
	}, [updateShowText]);

	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-[400px]'>
				<Loading size='lg' />
			</div>
		);
	}

	if (error || !project) {
		return (
			<div className='flex items-center justify-center min-h-[400px]'>
				<div className='text-center'>
					<p className='text-red-500 mb-4'>
						{error || "Không tìm thấy dự án"}
					</p>
					<Button onClick={() => navigate("/home")} variant='default'>
						Quay lại trang chủ
					</Button>
				</div>
			</div>
		);
	}

	const renderTabsPanel = () => (
		<div className='h-full w-full p-1'>
			<div ref={panelRef} className='h-full w-full relative'>
				<div className='h-full w-full bg-card border border-border rounded-xl overflow-hidden flex flex-col'>
					<div className='flex items-center justify-between px-4 py-3 border-b border-border'>
						<div className='flex gap-1'>
							{TABS.map((tab) => (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={cn(
										"flex items-center rounded-lg text-sm font-medium transition-all",
										showTabText
											? "gap-1.5 px-3 py-1.5"
											: "gap-0 px-2 py-1.5",
										activeTab === tab.id
											? "bg-primary text-primary-foreground"
											: "text-muted-foreground hover:text-foreground hover:bg-muted"
									)}
								>
									{tab.icon}
									<span
										className={cn(
											"transition-all duration-200 ease-in-out overflow-hidden whitespace-nowrap",
											showTabText
												? "max-w-[200px] opacity-100 ml-1.5"
												: "max-w-0 opacity-0 ml-0"
										)}
									>
										{tab.label}
									</span>
								</button>
							))}
						</div>
						<div className='flex items-center gap-3'>
							{(isSavingOrder ||
								videosLoading ||
								isUploading) && (
								<Loader2 className='w-3 h-3 animate-spin text-muted-foreground' />
							)}
							{storageInfo && (
								<button
									onClick={() => setStorageOverlayOpen(true)}
									className='text-xs font-medium text-muted-foreground hover:text-foreground transition-colors'
								>
									{storageInfo.usedFormatted} /{" "}
									{storageInfo.limitFormatted}
								</button>
							)}
						</div>
					</div>

					<div className='flex-1 overflow-y-auto p-4 relative'>
						<div
							className={cn(
								"h-full",
								activeTab === "upload" ? "block" : "hidden"
							)}
						>
							<VideoUploader
								projectId={id || ""}
								onUploadComplete={loadVideos}
								onUpload={handleVideoUpload}
								currentVideoCount={videos.length}
								onUploadingChange={setIsUploading}
							/>
						</div>

						<div
							className={cn(
								"h-full",
								activeTab === "videos" ? "block" : "hidden"
							)}
						>
							<ServerVideoList
								videos={videos}
								selectedVideoFilename={
									selectedVideo?.filename || null
								}
								onVideoSelect={setSelectedVideo}
								onVideoDelete={handleVideoDelete}
								onOrderChange={handleOrderChange}
								onVideosChange={handleVideosChange}
								onSavingChange={setIsSavingOrder}
								isLoading={videosLoading}
								projectId={id || ""}
								isPlaying={isVideoPlaying}
							/>
						</div>

						<div
							className={cn(
								"h-full",
								activeTab === "settings" ? "block" : "hidden"
							)}
						>
							<GenerationOptions
								settings={generationSettings}
								onSettingsChange={setGenerationSettings}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);

	const renderVideoPanel = () => (
		<div className='h-full w-full p-1'>
			<StreamingVideoPlayer
				video={selectedVideo}
				projectId={id || ""}
				className='h-full border border-border'
				videoMetadata={selectedVideo}
				onPlayingChange={setIsVideoPlaying}
			/>
		</div>
	);

	const renderScriptPanel = () => (
		<div className='h-full w-full p-1'>
			<div className='h-full w-full bg-card border border-border rounded-xl overflow-hidden flex flex-col'>
				<div className='flex items-center justify-between px-4 py-3 border-b border-border'>
					<h3 className='text-sm font-semibold text-foreground flex items-center gap-2'>
						<FileText className='w-4 h-4' />
						Script Review
					</h3>
					<span
						className={cn(
							"text-xs px-2 py-1 rounded-full",
							project.status === "completed"
								? "bg-green-500/10 text-green-500"
								: project.status === "processing"
								? "bg-yellow-500/10 text-yellow-500"
								: project.status === "failed"
								? "bg-red-500/10 text-red-500"
								: "bg-muted text-muted-foreground"
						)}
					>
						{project.status === "completed"
							? "Hoàn thành"
							: project.status === "processing"
							? "Đang xử lý"
							: project.status === "failed"
							? "Thất bại"
							: "Chờ xử lý"}
					</span>
				</div>

				<div className='flex-1 overflow-hidden'>
					<ScriptReview
						scriptContent={project.scriptContent}
						status={project.status}
					/>
				</div>
			</div>
		</div>
	);

	const renderLayout = () => {
		switch (layout) {
			case "grid2":
				return (
					<PanelGroup
						direction='horizontal'
						className='h-full w-full'
					>
						<Panel
							defaultSize={30}
							minSize={20}
							className='w-full'
							onResize={handlePanelResize}
						>
							{renderTabsPanel()}
						</Panel>
						<PanelResizeHandle className='w-1 bg-transparent hover:bg-primary/20 transition-colors cursor-col-resize' />
						<Panel defaultSize={70} minSize={40} className='w-full'>
							<PanelGroup
								direction='vertical'
								className='h-full w-full'
							>
								<Panel
									defaultSize={55}
									minSize={30}
									className='w-full'
								>
									{renderVideoPanel()}
								</Panel>
								<PanelResizeHandle className='h-1 bg-transparent hover:bg-primary/20 transition-colors cursor-row-resize' />
								<Panel
									defaultSize={45}
									minSize={20}
									className='w-full'
								>
									{renderScriptPanel()}
								</Panel>
							</PanelGroup>
						</Panel>
					</PanelGroup>
				);
			case "grid3":
				return (
					<PanelGroup direction='vertical' className='h-full w-full'>
						<Panel defaultSize={45} minSize={20} className='w-full'>
							{renderScriptPanel()}
						</Panel>
						<PanelResizeHandle className='h-1 bg-transparent hover:bg-primary/20 transition-colors cursor-row-resize' />
						<Panel defaultSize={55} minSize={30} className='w-full'>
							<PanelGroup
								direction='horizontal'
								className='h-full w-full'
							>
								<Panel
									defaultSize={30}
									minSize={20}
									className='w-full'
									onResize={handlePanelResize}
								>
									{renderTabsPanel()}
								</Panel>
								<PanelResizeHandle className='w-1 bg-transparent hover:bg-primary/20 transition-colors cursor-col-resize' />
								<Panel
									defaultSize={70}
									minSize={40}
									className='w-full'
								>
									{renderVideoPanel()}
								</Panel>
							</PanelGroup>
						</Panel>
					</PanelGroup>
				);
			case "grid1":
			default:
				return (
					<PanelGroup direction='vertical' className='h-full w-full'>
						<Panel defaultSize={55} minSize={30} className='w-full'>
							<PanelGroup
								direction='horizontal'
								className='h-full w-full'
							>
								<Panel
									defaultSize={30}
									minSize={20}
									className='w-full'
									onResize={handlePanelResize}
								>
									{renderTabsPanel()}
								</Panel>
								<PanelResizeHandle className='w-1 bg-transparent hover:bg-primary/20 transition-colors cursor-col-resize' />
								<Panel
									defaultSize={70}
									minSize={40}
									className='w-full'
								>
									{renderVideoPanel()}
								</Panel>
							</PanelGroup>
						</Panel>
						<PanelResizeHandle className='h-1 bg-transparent hover:bg-primary/20 transition-colors cursor-row-resize' />
						<Panel defaultSize={45} minSize={20} className='w-full'>
							{renderScriptPanel()}
						</Panel>
					</PanelGroup>
				);
		}
	};

	return (
		<div className='h-full w-full p-4'>
			{renderLayout()}
			<StorageUpgradeOverlay
				isOpen={storageOverlayOpen}
				onClose={() => setStorageOverlayOpen(false)}
				onUpgradeSuccess={fetchStorageInfo}
			/>
		</div>
	);
};

export default ScriptGenerationServiceProjectPage;
