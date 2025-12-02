import {useEffect, useRef, useCallback} from "react";
import {useAuthStore} from "@/stores/authStore";
import authService from "@/services/AuthService";

interface UseSessionValidatorOptions {
	enabled?: boolean;
	interval?: number;
	onInvalid?: () => void;
}

export const useSessionValidator = (
	options: UseSessionValidatorOptions = {}
) => {
	const {enabled = true, interval = 30000, onInvalid} = options;

	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const user = useAuthStore((state) => state.user);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const isCheckingRef = useRef(false);
	const isStoppedRef = useRef(false);

	const validateSession = useCallback(async () => {
		if (
			!isAuthenticated ||
			!user ||
			isCheckingRef.current ||
			isStoppedRef.current
		) {
			return;
		}

		isCheckingRef.current = true;
		try {
			const result = await authService.validateSession();
			if (!result.success || !result.valid) {
				if (isStoppedRef.current) {
					return;
				}
				if (onInvalid) {
					onInvalid();
				} else {
					useAuthStore.getState().silentLogout();
					window.location.href = "/";
				}
			}
		} catch (error) {
			if (!isStoppedRef.current) {
				const isNetworkError =
					error instanceof Error &&
					(error.message.includes("Network Error") ||
						error.message.includes("ERR_CONNECTION_REFUSED") ||
						error.message.includes("Failed to fetch"));

				if (isNetworkError) {
					console.warn(
						"Session validation: Backend unavailable, will retry later"
					);
				} else {
					console.error("Session validation error:", error);
				}
			}
		} finally {
			isCheckingRef.current = false;
		}
	}, [isAuthenticated, user, onInvalid]);

	const stop = useCallback(() => {
		isStoppedRef.current = true;
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
	}, []);

	useEffect(() => {
		if (!enabled || !isAuthenticated || !user || isStoppedRef.current) {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
			return;
		}

		validateSession();

		intervalRef.current = setInterval(() => {
			if (!isStoppedRef.current) {
				validateSession();
			}
		}, interval);

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [enabled, isAuthenticated, user, interval, validateSession]);

	return {
		validateSession,
		stop,
	};
};
