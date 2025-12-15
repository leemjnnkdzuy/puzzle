import React, {useState, useEffect, useRef, useCallback} from "react";
import {
	Play,
	Pause,
	Volume2,
	VolumeX,
	SkipBack,
	SkipForward,
	Info,
} from "lucide-react";
import Overlay from "@/components/ui/Overlay";
import Button from "@/components/ui/Button";
import {cn, formatTime, formatDurationHMS} from "@/utils";
import {useTheme} from "@/hooks/useTheme";
import type {VideoFile} from "@/services/ScriptGenerationService";

export interface VideoPlayerControlsProps {
	videoRef: React.RefObject<HTMLVideoElement | null>;
	className?: string;
	videoMetadata?: VideoFile | null;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

const VideoPlayerControls: React.FC<VideoPlayerControlsProps> = ({
	videoRef,
	className,
	videoMetadata,
}) => {
	const {isDark} = useTheme();
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [volume, setVolume] = useState(1);
	const [isMuted, setIsMuted] = useState(false);
	const [playbackSpeed, setPlaybackSpeed] = useState(1);
	const [showSpeedMenu, setShowSpeedMenu] = useState(false);
	const [showInfoOverlay, setShowInfoOverlay] = useState(false);

	const speedMenuRef = useRef<HTMLDivElement>(null);
	const progressBarRef = useRef<HTMLDivElement>(null);
	const isDraggingRef = useRef(false);

	const sliderActiveColor = isDark ? "#ffffff" : "#000000";
	const sliderInactiveColor = isDark
		? "rgba(255, 255, 255, 0.3)"
		: "rgba(0, 0, 0, 0.3)";

	const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		const handleLoadedMetadata = () => {
			setDuration(video.duration || 0);
			setVolume(video.volume);
			setIsMuted(video.muted);
		};

		const handleTimeUpdate = () => {
			if (!isDraggingRef.current) {
				setCurrentTime(video.currentTime);
			}
		};

		const handleVolumeChange = () => {
			setVolume(video.volume);
			setIsMuted(video.muted);
		};

		const handlePlay = () => setIsPlaying(true);
		const handlePause = () => setIsPlaying(false);
		const handleEnded = () => setIsPlaying(false);

		video.addEventListener("loadedmetadata", handleLoadedMetadata);
		video.addEventListener("timeupdate", handleTimeUpdate);
		video.addEventListener("volumechange", handleVolumeChange);
		video.addEventListener("play", handlePlay);
		video.addEventListener("pause", handlePause);
		video.addEventListener("ended", handleEnded);

		if (video.readyState >= 1) {
			setDuration(video.duration || 0);
			setVolume(video.volume);
			setIsMuted(video.muted);
			setIsPlaying(!video.paused);
		}

		return () => {
			video.removeEventListener("loadedmetadata", handleLoadedMetadata);
			video.removeEventListener("timeupdate", handleTimeUpdate);
			video.removeEventListener("volumechange", handleVolumeChange);
			video.removeEventListener("play", handlePlay);
			video.removeEventListener("pause", handlePause);
			video.removeEventListener("ended", handleEnded);
		};
	}, [videoRef]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				speedMenuRef.current &&
				!speedMenuRef.current.contains(event.target as Node)
			) {
				setShowSpeedMenu(false);
			}
		};

		if (showSpeedMenu) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showSpeedMenu]);

	const seekToPosition = useCallback(
		(clientX: number) => {
			const video = videoRef.current;
			const progressBar = progressBarRef.current;
			if (!video || !progressBar || duration <= 0) return;

			const rect = progressBar.getBoundingClientRect();
			const x = clientX - rect.left;
			const percent = Math.max(0, Math.min(1, x / rect.width));
			const newTime = percent * duration;

			setCurrentTime(newTime);
			video.currentTime = newTime;
		},
		[videoRef, duration]
	);

	const handleProgressMouseDown = useCallback(
		(e: React.MouseEvent) => {
			isDraggingRef.current = true;
			seekToPosition(e.clientX);

			const handleMouseMove = (e: MouseEvent) => {
				seekToPosition(e.clientX);
			};

			const handleMouseUp = () => {
				isDraggingRef.current = false;
				document.removeEventListener("mousemove", handleMouseMove);
				document.removeEventListener("mouseup", handleMouseUp);
			};

			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
		},
		[seekToPosition]
	);

	const handleProgressTouchStart = useCallback(
		(e: React.TouchEvent) => {
			isDraggingRef.current = true;
			seekToPosition(e.touches[0].clientX);

			const handleTouchMove = (e: TouchEvent) => {
				seekToPosition(e.touches[0].clientX);
			};

			const handleTouchEnd = () => {
				isDraggingRef.current = false;
				document.removeEventListener("touchmove", handleTouchMove);
				document.removeEventListener("touchend", handleTouchEnd);
			};

			document.addEventListener("touchmove", handleTouchMove);
			document.addEventListener("touchend", handleTouchEnd);
		},
		[seekToPosition]
	);

	const handlePlayPause = () => {
		const video = videoRef.current;
		if (!video) return;

		if (video.paused) {
			video.play().catch(console.error);
		} else {
			video.pause();
		}
	};

	const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const video = videoRef.current;
		if (!video) return;

		const newVolume = parseFloat(e.target.value);
		video.volume = newVolume;
		video.muted = newVolume === 0;
	};

	const handleMuteToggle = () => {
		const video = videoRef.current;
		if (!video) return;

		if (video.muted) {
			video.muted = false;
			if (video.volume === 0) {
				video.volume = 0.5;
			}
		} else {
			video.muted = true;
		}
	};

	const handleSpeedChange = (speed: number) => {
		const video = videoRef.current;
		if (!video) return;

		video.playbackRate = speed;
		setPlaybackSpeed(speed);
		setShowSpeedMenu(false);
	};

	const handleSkip = (seconds: number) => {
		const video = videoRef.current;
		if (!video) return;

		video.currentTime = Math.max(
			0,
			Math.min(duration, video.currentTime + seconds)
		);
	};

	return (
		<div
			className={cn(
				"flex flex-col gap-2 p-4 bg-card border-t border-border",
				isDark ? "video-controls-dark" : "video-controls-light",
				className
			)}
		>
			<div
				ref={progressBarRef}
				className='relative h-2 rounded-lg cursor-pointer group'
				style={{backgroundColor: sliderInactiveColor}}
				onMouseDown={handleProgressMouseDown}
				onTouchStart={handleProgressTouchStart}
			>
				<div
					className='absolute top-0 left-0 h-full rounded-lg pointer-events-none'
					style={{
						width: `${progress}%`,
						backgroundColor: sliderActiveColor,
					}}
				/>
				<div
					className='absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity'
					style={{
						left: `calc(${progress}% - 6px)`,
						backgroundColor: sliderActiveColor,
					}}
				/>
			</div>

			<div className='flex items-center justify-between gap-2'>
				<div className='flex items-center gap-2'>
					<Button
						variant='text'
						size='icon'
						onClick={handlePlayPause}
						className='hover:bg-muted'
						aria-label={isPlaying ? "Pause" : "Play"}
					>
						{isPlaying ? (
							<Pause className='w-5 h-5' />
						) : (
							<Play className='w-5 h-5' />
						)}
					</Button>

					<Button
						variant='text'
						size='icon'
						onClick={() => handleSkip(-10)}
						className='hover:bg-muted'
						aria-label='Skip backward 10 seconds'
					>
						<SkipBack className='w-4 h-4' />
					</Button>

					<Button
						variant='text'
						size='icon'
						onClick={() => handleSkip(10)}
						className='hover:bg-muted'
						aria-label='Skip forward 10 seconds'
					>
						<SkipForward className='w-4 h-4' />
					</Button>

					<div className='text-xs text-muted-foreground min-w-[100px]'>
						{formatTime(currentTime)} / {formatTime(duration)}
					</div>
				</div>

				<div className='flex items-center gap-2'>
					<div className='flex items-center gap-1.5'>
						<Button
							variant='text'
							size='icon'
							onClick={handleMuteToggle}
							className='hover:bg-muted'
							aria-label={isMuted ? "Unmute" : "Mute"}
						>
							{isMuted || volume === 0 ? (
								<VolumeX className='w-4 h-4' />
							) : (
								<Volume2 className='w-4 h-4' />
							)}
						</Button>
						<input
							type='range'
							min='0'
							max='1'
							step='0.01'
							value={isMuted ? 0 : volume}
							onChange={handleVolumeChange}
							className='w-20 h-1 rounded-lg appearance-none cursor-pointer video-slider'
							style={{
								background: `linear-gradient(to right, ${sliderActiveColor} 0%, ${sliderActiveColor} ${
									(isMuted ? 0 : volume) * 100
								}%, ${sliderInactiveColor} ${
									(isMuted ? 0 : volume) * 100
								}%, ${sliderInactiveColor} 100%)`,
							}}
							aria-label='Volume'
						/>
					</div>

					<div className='relative' ref={speedMenuRef}>
						<Button
							variant='outline'
							size='icon'
							onClick={() => setShowSpeedMenu(!showSpeedMenu)}
							className='flex items-center justify-center flex-shrink-0 border-border hover:border-foreground/50 transition-colors text-xs'
							aria-label='Playback speed'
						>
							{playbackSpeed}x
						</Button>
						{showSpeedMenu && (
							<div className='absolute bottom-full right-0 mb-2 bg-card border border-border rounded-md shadow-lg z-50 min-w-[80px]'>
								{SPEED_OPTIONS.map((speed) => (
									<button
										key={speed}
										onClick={() => handleSpeedChange(speed)}
										className={cn(
											"w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors first:rounded-t-md last:rounded-b-md",
											playbackSpeed === speed &&
												"bg-muted font-medium"
										)}
									>
										{speed}x
									</button>
								))}
							</div>
						)}
					</div>

					<Button
						variant='outline'
						size='icon'
						onClick={() => setShowInfoOverlay(true)}
						className='flex items-center justify-center flex-shrink-0 border-border hover:border-foreground/50 transition-colors'
						aria-label='Video Info'
					>
						<Info className='w-4 h-4' />
					</Button>
				</div>
			</div>

			<Overlay
				isOpen={showInfoOverlay}
				onClose={() => setShowInfoOverlay(false)}
				contentClassName='max-w-lg'
			>
				<div className='p-6 space-y-4'>
					<h3 className='text-lg font-semibold text-foreground border-b border-border pb-2'>
						Thông tin chi tiết Video
					</h3>

					<div className='space-y-3'>
						<div className='grid grid-cols-2 gap-4 text-sm'>
							<div className='text-muted-foreground'>
								Độ phân giải (Resolution):
							</div>
							<div className='font-mono text-foreground'>
								{videoMetadata?.width
									? `${videoMetadata.width} x ${videoMetadata.height}`
									: videoRef.current?.videoWidth
									? `${videoRef.current.videoWidth} x ${videoRef.current.videoHeight}`
									: "N/A"}{" "}
								px
							</div>

							<div className='text-muted-foreground'>
								Thời lượng (Duration):
							</div>
							<div className='font-mono text-foreground'>
								{(() => {
									const dur =
										videoMetadata?.duration || duration;
									return (
										<span>
											{dur.toFixed(3)} s{" "}
											<span className='text-muted-foreground text-xs'>
												({formatDurationHMS(dur)})
											</span>
										</span>
									);
								})()}
							</div>

							<div className='text-muted-foreground'>
								Khung hình (FPS):
							</div>
							<div className='font-mono text-foreground'>
								{videoMetadata?.fps
									? Number(videoMetadata.fps).toFixed(1)
									: "N/A"}
							</div>

							<div className='text-muted-foreground'>
								Bitrate:
							</div>
							<div className='font-mono text-foreground'>
								{videoMetadata?.bitrate
									? `${videoMetadata.bitrate} kbps`
									: "N/A"}
							</div>

							<div className='text-muted-foreground'>
								Định dạng (Format):
							</div>
							<div className='font-mono text-foreground'>
								{videoMetadata?.format
									? videoMetadata.format
									: videoMetadata?.mimetype || "N/A"}
							</div>

							<div className='text-muted-foreground'>Codec:</div>
							<div className='font-mono text-foreground'>
								{videoMetadata?.codec
									? videoMetadata.codec
									: "N/A"}
							</div>

							<div className='text-muted-foreground'>
								Kích thước file (Size):
							</div>
							<div className='font-mono text-foreground'>
								{videoMetadata?.size
									? `${(
											videoMetadata.size /
											1024 /
											1024
									  ).toFixed(2)} MB`
									: "N/A"}
							</div>
						</div>
					</div>

					<div className='flex justify-end pt-4 '>
						<Button onClick={() => setShowInfoOverlay(false)}>
							Đóng
						</Button>
					</div>
				</div>
			</Overlay>
		</div>
	);
};

VideoPlayerControls.displayName = "VideoPlayerControls";
export default VideoPlayerControls;
