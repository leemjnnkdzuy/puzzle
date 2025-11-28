import {create} from "zustand";
import {DEFAULT_FPS} from "@/configs/AppConfig";
import type {PlaybackState} from "@/types/PlaybackStateType";

let playBackTimer: number | null = null;

const startTimer = (store: () => PlaybackState) => {
	if (playBackTimer) cancelAnimationFrame(playBackTimer);

	let lastUpdate = performance.now();

	const updateTime = () => {
		const state = store();
		if (state.isPlaying && state.currentTime < state.duration) {
			const now = performance.now();
			const delta = (now - lastUpdate) / 1000;
			lastUpdate = now;

			const newTime = state.currentTime + delta * state.speed;

			const effectiveDuration = Math.max(0, state.duration);

			if (newTime >= effectiveDuration) {
				const frameOffset = 1 / DEFAULT_FPS;
				const stopTime = Math.max(0, effectiveDuration - frameOffset);

				state.pause();
				state.setCurrentTime(stopTime);
				window.dispatchEvent(
					new CustomEvent("playback-seek", {
						detail: {time: stopTime},
					})
				);
			} else {
				state.setCurrentTime(newTime);
				window.dispatchEvent(
					new CustomEvent("playback-update", {
						detail: {time: newTime},
					})
				);
			}
		}
		playBackTimer = requestAnimationFrame(updateTime);
	};

	playBackTimer = requestAnimationFrame(updateTime);
};

const stopTimer = () => {
	if (playBackTimer) {
		cancelAnimationFrame(playBackTimer);
		playBackTimer = null;
	}
};

export const usePlaybackStore = create<PlaybackState>((set, get) => ({
	isPlaying: false,
	currentTime: 0,
	duration: 0,
	volume: 1,
	muted: false,
	previousVolume: 1,
	speed: 1.0,

	play: () => {
		const state = get();

		const effectiveDuration = Math.max(0, state.duration);

		if (effectiveDuration > 0) {
			const frameOffset = 1 / DEFAULT_FPS;
			const endThreshold = Math.max(0, effectiveDuration - frameOffset);

			if (state.currentTime >= endThreshold) {
				get().seek(0);
			}
		}

		set({isPlaying: true});
		startTimer(get);
	},

	pause: () => {
		set({isPlaying: false});
		stopTimer();
	},

	toggle: () => {
		const {isPlaying} = get();
		if (isPlaying) {
			get().pause();
		} else {
			get().play();
		}
	},

	seek: (time: number) => {
		const {duration} = get();
		const clampedTime = Math.max(0, Math.min(duration, time));
		set({currentTime: clampedTime});

		const event = new CustomEvent("playback-seek", {
			detail: {time: clampedTime},
		});
		window.dispatchEvent(event);
	},

	setVolume: (volume: number) =>
		set((state) => ({
			volume: Math.max(0, Math.min(1, volume)),
			muted: volume === 0,
			previousVolume: volume > 0 ? volume : state.previousVolume,
		})),

	setSpeed: (speed: number) => {
		const newSpeed = Math.max(0.1, Math.min(2.0, speed));
		set({speed: newSpeed});

		const event = new CustomEvent("playback-speed", {
			detail: {speed: newSpeed},
		});
		window.dispatchEvent(event);
	},

	setDuration: (duration: number) => set({duration}),
	setCurrentTime: (time: number) => set({currentTime: time}),

	mute: () => {
		const {volume, previousVolume} = get();
		set({
			muted: true,
			previousVolume: volume > 0 ? volume : previousVolume,
			volume: 0,
		});
	},

	unmute: () => {
		const {previousVolume} = get();
		set({muted: false, volume: previousVolume ?? 1});
	},

	toggleMute: () => {
		const {muted} = get();
		if (muted) {
			get().unmute();
		} else {
			get().mute();
		}
	},
}));
