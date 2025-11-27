import {createBrowserRouter} from "react-router-dom";
import type {RouteObject} from "react-router-dom";

// Types
import type {RouteTypes} from "@/types/RouteTypes";

// layouts
import NotThingLayout from "@/components/layout/NotThingLayout";

// Pages
import LandingPage from "@/pages/LandingPage";
import SignInPage from "@/pages/SignInPage";
import SignUpPage from "@/pages/SignUpPage";
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
	// TODO: Create pages for forgot-password, verification, reset-password
	// {
	// 	path: "/forgot-password",
	// 	component: ForgotPasswordPage,
	// 	layout: NotThingLayout,
	// },
	// {
	// 	path: "/verification",
	// 	component: VerificationPage,
	// 	layout: NotThingLayout,
	// },
	// {
	// 	path: "/reset-password",
	// 	component: ResetPasswordPage,
	// 	layout: NotThingLayout,
	// },
	{
		path: "*",
		component: NotFoundPage,
		layout: NotThingLayout,
	},
];

const privateRoutes: RouteTypes[] = [];

const router = createBrowserRouter(
	publicRoutes
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
			privateRoutes.map((route) => {
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
		)
);

export {router};
