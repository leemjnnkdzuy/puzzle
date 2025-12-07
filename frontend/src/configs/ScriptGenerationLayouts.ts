import { PanelBottom, PanelLeft, PanelTop } from "lucide-react";

export type ScriptGenerationLayout = "grid1" | "grid2" | "grid3";

export const scriptGenerationLayouts: Array<{
	value: ScriptGenerationLayout;
	label: string;
	icon: React.ComponentType<{className?: string}>;
}> = [
	{
		value: "grid1",
		label: "Mặc định",
		icon: PanelBottom,
	},
	{
		value: "grid2",
		label: "Layout 1",
		icon: PanelLeft,
	},
	{
		value: "grid3",
		label: "Layout 2",
		icon: PanelTop,
	},
];
