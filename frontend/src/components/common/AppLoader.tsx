import {type ReactElement, useEffect} from "react";
import {Navigate} from "react-router-dom";
import {useAuthStore} from "@/stores/authStore";
import Loading from "@/components/ui/Loading";

interface AppLoaderProps {
	children: ReactElement;
}

interface PublicRouteProps {
	children: ReactElement;
}

const AppLoader: React.FC<AppLoaderProps> = ({children}) => {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const loading = useAuthStore((state) => state.loading);
	const isInitialized = useAuthStore((state) => state.isInitialized);
	const checkAuth = useAuthStore((state) => state.checkAuth);

	useEffect(() => {
		if (!isInitialized) {
			checkAuth();
		}
	}, [isInitialized, checkAuth]);

	if (loading || !isInitialized) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<Loading size={40} color='rgb(17, 24, 39)' />
			</div>
		);
	}

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
