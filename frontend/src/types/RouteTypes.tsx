import React from "react";

interface RouteTypes {
	path: string;
	component: React.ComponentType;
	layout: React.ComponentType<{children: React.ReactNode}>;
}

export type {RouteTypes};
