import {createBrowserRouter} from "react-router-dom";
import type {RouteObject} from "react-router-dom";

// Types
import type {RouteTypes} from "@/types/RouteTypes";

// layouts
import NotThingLayout from "@/components/layout/NotThingLayout";

// Components
import AppLoader, {PublicRoute} from "@/components/common/AppLoader";

// Pages
import LandingPage from "@/pages/LandingPage";
import HomePage from "@/pages/HomePage";
import SignInPage from "@/pages/SignInPage";
import SignUpPage from "@/pages/SignUpPage";
import FogotPasswordPage from "@/pages/FogotPasswordPage";
import NotFoundPage from "@/pages/NotFoundPage";

const publicRoutes: RouteTypes[] = [
	{
		path: "/",
		component: LandingPage,
		layout: NotThingLayout,
	},
	{
		path: "/login",
		component: SignInPage,
		layout: NotThingLayout,
	},
	{
		path: "/register",
		component: SignUpPage,
		layout: NotThingLayout,
	},
	{
		path: "/forgot-password",
		component: FogotPasswordPage,
		layout: NotThingLayout,
	},
	{
		path: "*",
		component: NotFoundPage,
		layout: NotThingLayout,
	},
];

const guestOnlyRoutes: RouteTypes[] = [
	{
		path: "/login",
		component: SignInPage,
		layout: NotThingLayout,
	},
	{
		path: "/register",
		component: SignUpPage,
		layout: NotThingLayout,
	},
	{
		path: "/forgot-password",
		component: FogotPasswordPage,
		layout: NotThingLayout,
	},
];

const privateRoutes: RouteTypes[] = [
	{
		path: "/home",
		component: HomePage,
		layout: NotThingLayout,
	},
];

const router = createBrowserRouter(
	publicRoutes
		.filter(
			(route) =>
				!guestOnlyRoutes.some(
					(guestRoute) => guestRoute.path === route.path
				)
		)
		.map((route) => {
			const Page = route.component;
			const Layout = route.layout;
			return {
				path: route.path,
				element: (
					<Layout>
						<Page />
					</Layout>
				),
			} as RouteObject;
		})
		.concat(
			guestOnlyRoutes.map((route) => {
				const Page = route.component;
				const Layout = route.layout;
				return {
					path: route.path,
					element: (
						<PublicRoute>
							<Layout>
								<Page />
							</Layout>
						</PublicRoute>
					),
				} as RouteObject;
			})
		)
		.concat(
			privateRoutes.map((route) => {
				const Page = route.component;
				const Layout = route.layout;
				return {
					path: route.path,
					element: (
						<AppLoader>
							<Layout>
								<Page />
							</Layout>
						</AppLoader>
					),
				} as RouteObject;
			})
		)
);

export {router};
