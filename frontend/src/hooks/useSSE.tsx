import {useEffect, useRef, useState, useCallback} from "react";
import {DEFAULT_API_URL} from "@/configs/AppConfig";
import {useAuthStore} from "@/stores/authStore";
import authService from "@/services/AuthService";
import type {Notification} from "@/services/NotificationService";

export type SSEMessage =
	| {
			type: "notification";
			data: Notification;
	  }
	| {
			type: "unread-count";
			data: {count: number};
	  }
	| {
			type: "logout";
			data: {sessionId?: string; reason?: string};
	  }
	| {
			type: "transaction";
			data: {
				transactionId: string;
				status: "pending" | "paid" | "completed" | "failed";
			};
	  }
	| {
			type: "balance";
			data: {
				credit: number;
				message?: string;
			};
	  }
	| {
			type: "storage";
			data: {
				limit: number;
				used: number;
				available: number;
				limitFormatted: string;
				usedFormatted: string;
				availableFormatted: string;
				credit: number;
			};
	  };

interface UseSSEReturn {
	isConnected: boolean;
	onMessage: (callback: (message: SSEMessage) => void) => void;
	offMessage: (callback: (message: SSEMessage) => void) => void;
}

export const useSSE = (): UseSSEReturn => {
	const [isConnected, setIsConnected] = useState(false);
	const [sseToken, setSseToken] = useState<string | null>(null);
	const eventSourceRef = useRef<EventSource | null>(null);
	const callbacksRef = useRef<Set<(message: SSEMessage) => void>>(new Set());
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const user = useAuthStore((state) => state.user);
	const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
		null
	);
	const refreshTokenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
		null
	);
	const reconnectAttemptsRef = useRef(0);
	const isFetchingTokenRef = useRef(false);
	const maxReconnectAttempts = 5;
	const tokenRefreshInterval = 50 * 60 * 1000;

	const fetchSSEToken = useCallback(async (): Promise<string | null> => {
		if (isFetchingTokenRef.current) {
			return null;
		}

		isFetchingTokenRef.current = true;
		try {
			const result = await authService.getSSEToken();
			if (result.success && result.data?.token) {
				setSseToken(result.data.token);
				return result.data.token;
			} else {
				return null;
			}
		} catch {
			return null;
		} finally {
			isFetchingTokenRef.current = false;
		}
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

		const initializeSSE = async (token?: string) => {
			if (!isAuthenticated || !user) {
				cleanup();
				return;
			}

			let currentToken = token || sseToken;
			if (!currentToken) {
				currentToken = await fetchSSEToken();
				if (!currentToken) {
					return;
				}
			}

			if (refreshTokenTimeoutRef.current) {
				clearTimeout(refreshTokenTimeoutRef.current);
			}
			refreshTokenTimeoutRef.current = setTimeout(async () => {
				if (mounted && isAuthenticated && user) {
					const newToken = await fetchSSEToken();
					if (newToken && mounted) {
						cleanup();
						setTimeout(() => {
							if (mounted && isAuthenticated && user) {
								initializeSSE(newToken);
							}
						}, 100);
					}
				}
			}, tokenRefreshInterval);

			const url = `${DEFAULT_API_URL}/api/notifications/stream?token=${encodeURIComponent(
				currentToken
			)}`;

			const eventSource = new EventSource(url);
			currentEventSource = eventSource;

			const handleOpen = () => {
				if (mounted && currentEventSource === eventSource) {
					setIsConnected(true);
					reconnectAttemptsRef.current = 0;
					if (reconnectTimeoutRef.current) {
						clearTimeout(reconnectTimeoutRef.current);
						reconnectTimeoutRef.current = null;
					}
				}
			};

			const handleMessage = (event: MessageEvent) => {
				if (!mounted || currentEventSource !== eventSource) return;

				try {
					const message: SSEMessage = JSON.parse(event.data);

					if (message.type === "logout") {
						cleanup();
						useAuthStore.getState().silentLogout();
						return;
					}

					queueMicrotask(() => {
						if (!mounted || currentEventSource !== eventSource)
							return;

						callbacksRef.current.forEach((callback) => {
							try {
								callback(message);
							} catch (error) {
								console.error("Error in SSE callback:", error);
							}
						});
					});
				} catch (error) {
					console.error(
						"Error parsing SSE message:",
						error,
						event.data
					);
				}
			};

			const handleError = () => {
				if (mounted && currentEventSource === eventSource) {
					const eventSourceState = eventSource.readyState;
					if (eventSourceState === EventSource.CLOSED) {
						console.warn("SSE connection closed");
					} else if (eventSourceState === EventSource.CONNECTING) {
						console.warn("SSE connection failed, retrying...");
					}

					setIsConnected(false);

					if (reconnectTimeoutRef.current) {
						clearTimeout(reconnectTimeoutRef.current);
					}

					if (reconnectAttemptsRef.current < maxReconnectAttempts) {
						const delay = Math.min(
							1000 * Math.pow(2, reconnectAttemptsRef.current),
							30000
						);
						reconnectAttemptsRef.current += 1;

						reconnectTimeoutRef.current = setTimeout(async () => {
							if (mounted && isAuthenticated && user) {
								const newToken = await fetchSSEToken();
								if (newToken) {
									cleanup();
									initializeSSE(newToken);
								} else {
									cleanup();
									initializeSSE();
								}
							}
						}, delay);
					} else {
						setTimeout(async () => {
							if (mounted && isAuthenticated && user) {
								reconnectAttemptsRef.current = 0;
								const newToken = await fetchSSEToken();
								cleanup();
								if (newToken) {
									initializeSSE(newToken);
								} else {
									initializeSSE();
								}
							}
						}, 60000);
					}
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

		if (isAuthenticated && user) {
			initializeSSE();
		} else {
			cleanup();
			setSseToken(null);
		}

		return () => {
			mounted = false;
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
				reconnectTimeoutRef.current = null;
			}
			if (refreshTokenTimeoutRef.current) {
				clearTimeout(refreshTokenTimeoutRef.current);
				refreshTokenTimeoutRef.current = null;
			}
			reconnectAttemptsRef.current = 0;
			cleanup();
		};
	}, [isAuthenticated, user, sseToken, fetchSSEToken, tokenRefreshInterval]);

	const onMessage = useCallback((callback: (message: SSEMessage) => void) => {
		callbacksRef.current.add(callback);
	}, []);

	const offMessage = useCallback(
		(callback: (message: SSEMessage) => void) => {
			callbacksRef.current.delete(callback);
		},
		[]
	);

	return {isConnected, onMessage, offMessage};
};
