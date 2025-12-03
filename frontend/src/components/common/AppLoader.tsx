import {type ReactElement} from "react";
import {Navigate} from "react-router-dom";
import {useAuthStore} from "@/stores/authStore";

interface AppLoaderProps {
	children: ReactElement;
}

interface PublicRouteProps {
	children: ReactElement;
}

const AppLoader: React.FC<AppLoaderProps> = ({children}) => {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

	if (!isAuthenticated) {
		return <Navigate to='/' replace />;
	}

	return children;
};

export const PublicRoute: React.FC<PublicRouteProps> = ({children}) => {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

	if (isAuthenticated) {
		return <Navigate to='/home' replace />;
	}

	return children;
};

AppLoader.displayName = "AppLoader";
PublicRoute.displayName = "PublicRoute";

export default AppLoader;
