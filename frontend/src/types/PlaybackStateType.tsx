export interface PlaybackState {
	isPlaying: boolean;
	currentTime: number;
	duration: number;
	volume: number;
	muted: boolean;
	previousVolume: number;
	speed: number;
	play: () => void;
	pause: () => void;
	toggle: () => void;
	seek: (time: number) => void;
	setVolume: (volume: number) => void;
	setSpeed: (speed: number) => void;
	setDuration: (duration: number) => void;
	setCurrentTime: (time: number) => void;
	mute: () => void;
	unmute: () => void;
	toggleMute: () => void;
}
