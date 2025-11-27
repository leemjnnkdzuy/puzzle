import type React from "react";

export interface VideoPlayerProps {
	src: string;
	poster?: string;
	className?: string;
	clipStartTime?: number;
	trimStart?: number;
	trimEnd?: number;
	clipDuration?: number;
	trackMuted?: boolean;
	autoPlay?: boolean;
	onTimeUpdate?: (e: React.SyntheticEvent<HTMLVideoElement, Event>) => void;
	videoRef?: React.RefObject<HTMLVideoElement | null>;
}
