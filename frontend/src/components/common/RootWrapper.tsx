import type {ReactNode} from "react";
import {useEffect} from "react";
import ScrollToTop from "./ScrollToTop";
import {useAppInitStore} from "@/stores/appInitStore";
import Loading from "@/components/ui/Loading";

interface RootWrapperProps {
	children: ReactNode;
}

const RootWrapper = ({children}: RootWrapperProps) => {
	const isInitializing = useAppInitStore((state) => state.isInitializing);
	const isInitialized = useAppInitStore((state) => state.isInitialized);
	const initializeApp = useAppInitStore((state) => state.initializeApp);

	useEffect(() => {
		if (!isInitialized && !isInitializing) {
			initializeApp();
		}
	}, [isInitialized, isInitializing, initializeApp]);

	return (
		<>
			<ScrollToTop />
			{isInitializing || !isInitialized ? (
				<div className='flex items-center justify-center min-h-screen'>
					<Loading size={40} color='rgb(17, 24, 39)' />
				</div>
			) : (
				children
			)}
		</>
	);
};

export default RootWrapper;
