import {useEffect} from "react";
import {useSSE, type SSEMessage} from "@/hooks/useSSE";
import {useCreditStore} from "@/stores/creditStore";
import {useAuthStore} from "@/stores/authStore";

export const useCreditSSE = () => {
	const {onMessage, offMessage} = useSSE();
	const {fetchCredit, updateFromSSE} = useCreditStore();
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const user = useAuthStore((state) => state.user);

	useEffect(() => {
		if (isAuthenticated && user) {
			fetchCredit();
		}
	}, [isAuthenticated, user, fetchCredit]);

	useEffect(() => {
		const handleSSEMessage = (message: SSEMessage) => {
			if (message.type === "balance") {
				const {credit} = message.data;
				updateFromSSE(credit);
			}
		};

		onMessage(handleSSEMessage);

		return () => {
			offMessage(handleSSEMessage);
		};
	}, [onMessage, offMessage, updateFromSSE]);
};
