import {useRef, useEffect} from "react";
import {usePlaybackStore} from "../../hooks/usePlaybackStore";
import type {VideoPlayerProps} from "../../types/VideoPlayerPropsType";

const VideoPlayer = ({
	src,
	poster,
	className = "",
	clipStartTime = 0,
	trimStart = 0,
	trimEnd = 0,
	clipDuration = 0,
	trackMuted = false,
	autoPlay = false,
	onTimeUpdate,
	videoRef: externalVideoRef,
}: VideoPlayerProps) => {
	const fallbackRef = useRef<HTMLVideoElement>(null);
	const videoRef = externalVideoRef ?? fallbackRef;
	const {isPlaying, currentTime, volume, speed, muted} = usePlaybackStore();

	const effectiveDuration = Math.max(0, clipDuration - trimStart - trimEnd);
	const clipEndTime = clipStartTime + effectiveDuration;
	const isInClipRange =
		effectiveDuration > 0 &&
		currentTime >= clipStartTime &&
		currentTime < clipEndTime;
	const hasClipRange = effectiveDuration > 0;

	useEffect(() => {
		if (!autoPlay || !hasClipRange) return;

		const video = videoRef.current;
		if (!video || !isInClipRange) return;

		const handleSeekEvent = (e: Event) => {
			const customEvent = e as CustomEvent<{time: number}>;
			const timelineTime = customEvent.detail.time;
			const videoTime = Math.max(
				trimStart,
				Math.min(
					clipDuration - trimEnd,
					timelineTime - clipStartTime + trimStart
				)
			);
			video.currentTime = videoTime;
		};

		const handleUpdateEvent = (e: Event) => {
			const customEvent = e as CustomEvent<{time: number}>;
			const timelineTime = customEvent.detail.time;
			const targetTime = Math.max(
				trimStart,
				Math.min(
					clipDuration - trimEnd,
					timelineTime - clipStartTime + trimStart
				)
			);

			if (Math.abs(video.currentTime - targetTime) > 0.5) {
				video.currentTime = targetTime;
			}
		};

		const handleSpeed = (e: Event) => {
			const customEvent = e as CustomEvent<{speed: number}>;
			video.playbackRate = customEvent.detail.speed;
		};

		window.addEventListener("playback-seek", handleSeekEvent);
		window.addEventListener("playback-update", handleUpdateEvent);
		window.addEventListener("playback-speed", handleSpeed);

		return () => {
			window.removeEventListener("playback-seek", handleSeekEvent);
			window.removeEventListener("playback-update", handleUpdateEvent);
			window.removeEventListener("playback-speed", handleSpeed);
		};
	}, [
		autoPlay,
		clipStartTime,
		trimStart,
		trimEnd,
		clipDuration,
		isInClipRange,
		hasClipRange,
		trackMuted,
		videoRef,
	]);

	useEffect(() => {
		if (!autoPlay || hasClipRange) return;
		const video = videoRef.current;
		if (!video) return;

		video.muted = true;

		const playPromise = video.play();
		if (playPromise !== undefined) {
			playPromise.catch((error) => {
				console.log("Autoplay prevented:", error);
			});
		}
	}, [autoPlay, hasClipRange, videoRef]);

	useEffect(() => {
		if (!autoPlay || !hasClipRange) return;
		const video = videoRef.current;
		if (!video) return;

		if (isPlaying && isInClipRange) {
			video.play().catch(() => {});
		} else {
			video.pause();
		}
	}, [isPlaying, isInClipRange, autoPlay, hasClipRange, videoRef]);

	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		video.volume = volume;
		video.muted = muted || trackMuted;
		video.playbackRate = speed;
	}, [volume, speed, muted, trackMuted, videoRef]);

	return (
		<video
			ref={videoRef}
			src={src}
			poster={poster}
			className={`max-w-full max-h-full object-contain ${className}`}
			playsInline
			preload='auto'
			controls={false}
			disablePictureInPicture
			disableRemotePlayback
			muted={muted || trackMuted}
			style={{pointerEvents: "none"}}
			onContextMenu={(e) => e.preventDefault()}
			onTimeUpdate={onTimeUpdate}
		/>
	);
};

export default VideoPlayer;
