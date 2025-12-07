import {useEffect} from "react";
import {useSSE, type SSEMessage} from "@/hooks/useSSE";
import {useStorageStore} from "@/stores/storageStore";
import {useAuthStore} from "@/stores/authStore";

export const useStorageSSE = () => {
	const {onMessage, offMessage} = useSSE();
	const {fetchStorageInfo, updateFromSSE} = useStorageStore();
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const user = useAuthStore((state) => state.user);

	useEffect(() => {
		if (isAuthenticated && user) {
			fetchStorageInfo();
		}
	}, [isAuthenticated, user, fetchStorageInfo]);

	useEffect(() => {
		const handleSSEMessage = (message: SSEMessage) => {
			if (message.type === "storage") {
				const storageInfo = message.data;
				if (storageInfo) {
					updateFromSSE(storageInfo);
				}
			}
		};

		onMessage(handleSSEMessage);

		return () => {
			offMessage(handleSSEMessage);
		};
	}, [onMessage, offMessage, updateFromSSE]);
};

