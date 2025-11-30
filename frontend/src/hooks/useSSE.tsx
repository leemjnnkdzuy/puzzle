import {useEffect, useRef, useState, useCallback} from "react";
import {DEFAULT_API_URL} from "@/configs/AppConfig";
import {useAuthStore} from "@/stores/authStore";

type SSEMessage = {
	type: "notification" | "unread-count";
	data: any;
};

interface UseSSEReturn {
	isConnected: boolean;
	onMessage: (callback: (message: SSEMessage) => void) => void;
	offMessage: (callback: (message: SSEMessage) => void) => void;
}

export const useSSE = (): UseSSEReturn => {
	const [isConnected, setIsConnected] = useState(false);
	const eventSourceRef = useRef<EventSource | null>(null);
	const callbacksRef = useRef<Set<(message: SSEMessage) => void>>(new Set());
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const user = useAuthStore((state) => state.user);

	const getAccessToken = useCallback((): string | null => {
		const cookies = document.cookie.split(";");
		for (const cookie of cookies) {
			const [name, value] = cookie.trim().split("=");
			if (name === "accessToken") {
				return decodeURIComponent(value);
			}
		}
		return null;
	}, []);

	useEffect(() => {
		let mounted = true;
		let currentEventSource: EventSource | null = null;

		const cleanup = () => {
			if (currentEventSource) {
				currentEventSource.close();
				currentEventSource = null;
			}
			if (eventSourceRef.current) {
				eventSourceRef.current.close();
				eventSourceRef.current = null;
			}
			if (mounted) {
				setIsConnected(false);
			}
		};

		const initializeSSE = () => {
			if (!isAuthenticated || !user) {
				cleanup();
				return;
			}

			const token = getAccessToken();
			if (!token) {
				return;
			}

			// Create SSE connection
			// Note: EventSource automatically sends cookies for same-origin requests
			// For cross-origin, CORS must allow credentials
			const url = `${DEFAULT_API_URL}/api/notifications/stream`;
			const eventSource = new EventSource(url);

			currentEventSource = eventSource;

			const handleOpen = () => {
				if (mounted && currentEventSource === eventSource) {
					console.log("SSE connected");
					setIsConnected(true);
				}
			};

			const handleMessage = (event: MessageEvent) => {
				if (!mounted || currentEventSource !== eventSource) return;

				try {
					const message: SSEMessage = JSON.parse(event.data);
					// Call all registered callbacks
					callbacksRef.current.forEach((callback) => {
						try {
							callback(message);
						} catch (error) {
							console.error("Error in SSE callback:", error);
						}
					});
				} catch (error) {
					console.error("Error parsing SSE message:", error);
				}
			};

			const handleError = (error: Event) => {
				if (mounted && currentEventSource === eventSource) {
					console.error("SSE error:", error);
					setIsConnected(false);
					// Try to reconnect after a delay
					setTimeout(() => {
						if (mounted && isAuthenticated && user) {
							cleanup();
							initializeSSE();
						}
					}, 3000);
				}
			};

			eventSource.addEventListener("open", handleOpen);
			eventSource.addEventListener("message", handleMessage);
			eventSource.addEventListener("error", handleError);

			if (mounted && currentEventSource === eventSource) {
				eventSourceRef.current = eventSource;
			} else {
				eventSource.close();
			}

			return () => {
				eventSource.removeEventListener("open", handleOpen);
				eventSource.removeEventListener("message", handleMessage);
				eventSource.removeEventListener("error", handleError);
				eventSource.close();
			};
		};

		initializeSSE();

		return () => {
			mounted = false;
			cleanup();
		};
	}, [isAuthenticated, user, getAccessToken]);

	const onMessage = useCallback(
		(callback: (message: SSEMessage) => void) => {
			callbacksRef.current.add(callback);
		},
		[]
	);

	const offMessage = useCallback(
		(callback: (message: SSEMessage) => void) => {
			callbacksRef.current.delete(callback);
		},
		[]
	);

	return {isConnected, onMessage, offMessage};
};

