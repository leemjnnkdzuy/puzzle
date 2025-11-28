import {type ReactElement} from "react";
import {Navigate} from "react-router-dom";
import {useAuth} from "@/hooks/useAuth";
import Loading from "@/components/ui/Loading";

interface AppLoaderProps {
	children: ReactElement;
}

interface PublicRouteProps {
	children: ReactElement;
}

const AppLoader: React.FC<AppLoaderProps> = ({children}) => {
	const {isAuthenticated, loading} = useAuth();

	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<Loading size={40} />
			</div>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to='/' replace />;
	}

	return children;
};

export const PublicRoute: React.FC<PublicRouteProps> = ({children}) => {
	const {isAuthenticated, loading} = useAuth({skipInitialCheck: true});

	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<Loading size={40} />
			</div>
		);
	}

	if (isAuthenticated) {
		return <Navigate to='/home' replace />;
	}

	return children;
};

AppLoader.displayName = "AppLoader";
PublicRoute.displayName = "PublicRoute";

export default AppLoader;
