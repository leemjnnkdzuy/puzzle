import {useEffect, useCallback, useRef, useState} from "react";
import {useSSE, type SSEMessage} from "./useSSE";
import {useSessionValidator} from "./useSessionValidator";
import {useAuthStore} from "@/stores/authStore";
import {useNavigate} from "react-router-dom";
import {useGlobalNotificationPopup} from "./useGlobalNotificationPopup";

export const useLogoutListener = () => {
	const {onMessage, offMessage, isConnected} = useSSE();
	const navigate = useNavigate();
	const {showError} = useGlobalNotificationPopup();
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const sessionValidatorRef = useRef<{stop: () => void} | null>(null);

	const handleLogout = useCallback(
		(reason?: string) => {
			if (isLoggingOut) {
				return;
			}
			setIsLoggingOut(true);

			if (sessionValidatorRef.current) {
				sessionValidatorRef.current.stop();
			}

			showError(
				reason || "Your session has been revoked. Please login again."
			);

			useAuthStore.getState().silentLogout();

			navigate("/");
		},
		[showError, navigate, isLoggingOut]
	);

	useEffect(() => {
		const handleSSELogoutEvent = (message: SSEMessage) => {
			if (message.type === "logout") {
				handleLogout(message.data.reason);
			}
		};

		onMessage(handleSSELogoutEvent);

		return () => {
			offMessage(handleSSELogoutEvent);
		};
	}, [onMessage, offMessage, handleLogout]);

	const sessionValidator = useSessionValidator({
		enabled: !isConnected && !isLoggingOut,
		interval: 30000,
		onInvalid: () => {
			handleLogout("Your session has been revoked. Please login again.");
		},
	});

	useEffect(() => {
		sessionValidatorRef.current = sessionValidator;
	}, [sessionValidator]);
};
