import {useEffect, useRef} from "react";
import type {ReactNode, ComponentType} from "react";
import {useLocation} from "react-router-dom";
import {getRouteLayout} from "@/routes";

const ScrollToTop = () => {
	const {pathname} = useLocation();
	const previousLayoutRef = useRef<ComponentType<{
		children: ReactNode;
	}> | null>(null);
	const previousPathnameRef = useRef<string>("");

	useEffect(() => {
		const currentLayout = getRouteLayout(pathname);
		const previousLayout = previousLayoutRef.current;
		const previousPathname = previousPathnameRef.current;

		if (
			currentLayout &&
			previousLayout &&
			currentLayout === previousLayout &&
			pathname !== previousPathname
		) {
			window.scrollTo({top: 0, behavior: "smooth"});
		}

		previousLayoutRef.current = currentLayout;
		previousPathnameRef.current = pathname;
	}, [pathname]);

	return null;
};

export default ScrollToTop;
