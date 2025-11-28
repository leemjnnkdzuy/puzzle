import type {ReactNode} from "react";
import ScrollToTop from "./ScrollToTop";

interface RootWrapperProps {
	children: ReactNode;
}

const RootWrapper = ({children}: RootWrapperProps) => {
	return (
		<>
			<ScrollToTop />
			{children}
		</>
	);
};

export default RootWrapper;
