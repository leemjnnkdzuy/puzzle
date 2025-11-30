import {createBrowserRouter} from "react-router-dom";
import type {RouteObject} from "react-router-dom";
import React from "react";

export interface RouteTypes {
	path: string;
	component: React.ComponentType;
	layout: React.ComponentType<{children: React.ReactNode}>;
}

// layouts
import NotThingLayout from "@/components/layout/NotThingLayout";
import HeaderFooterLayout from "@/components/layout/HeaderFooterLayout";
import SidebarLayout from "@/components/layout/SidebarLayout";

// Components
import AppLoader, {PublicRoute} from "@/components/common/AppLoader";
import RootWrapper from "@/components/common/RootWrapper";

// Pages
import LandingPage from "@/pages/LandingPage";
import HomePage from "@/pages/HomePage";
import SignInPage from "@/pages/SignInPage";
import SignUpPage from "@/pages/SignUpPage";
import FogotPasswordPage from "@/pages/FogotPasswordPage";
import NotFoundPage from "@/pages/NotFoundPage";
import TermsOfServicePage from "@/pages/TermsOfServicePage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import AboutPage from "@/pages/AboutPage";

const publicRoutes: RouteTypes[] = [
	{
		path: "/",
		component: LandingPage,
		layout: HeaderFooterLayout,
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
	{
		path: "/terms-of-service",
		component: TermsOfServicePage,
		layout: HeaderFooterLayout,
	},
	{
		path: "/privacy-policy",
		component: PrivacyPolicyPage,
		layout: HeaderFooterLayout,
	},
	{
		path: "/about",
		component: AboutPage,
		layout: HeaderFooterLayout,
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
		layout: SidebarLayout,
	},
];

export const getRouteLayout = (pathname: string) => {
	const allRoutes = [
		...publicRoutes.filter(
			(route) =>
				!guestOnlyRoutes.some(
					(guestRoute) => guestRoute.path === route.path
				)
		),
		...guestOnlyRoutes,
		...privateRoutes,
	];

	const exactMatch = allRoutes.find((route) => route.path === pathname);
	if (exactMatch) {
		return exactMatch.layout;
	}

	const wildcardRoute = allRoutes.find((route) => route.path === "*");
	if (wildcardRoute) {
		return wildcardRoute.layout;
	}

	return null;
};

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
					<RootWrapper>
						<Layout>
							<Page />
						</Layout>
					</RootWrapper>
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
						<RootWrapper>
							<PublicRoute>
								<Layout>
									<Page />
								</Layout>
							</PublicRoute>
						</RootWrapper>
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
						<RootWrapper>
							<AppLoader>
								<Layout>
									<Page />
								</Layout>
							</AppLoader>
						</RootWrapper>
					),
				} as RouteObject;
			})
		)
);

export {router};
