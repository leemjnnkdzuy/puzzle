import {createContext, useContext} from "react";
import { type ScriptGenerationLayout } from "@/configs/ScriptGenerationLayouts";

interface ProjectLayoutContextType {
	setHasUnsavedChanges: (value: boolean) => void;
	setOnSave: (saveFn: (() => Promise<void> | void) | undefined) => void;
	scriptGenerationLayout: ScriptGenerationLayout;
	setScriptGenerationLayout: (layout: ScriptGenerationLayout) => void;
}

export const ProjectLayoutContext =
	createContext<ProjectLayoutContextType | null>(null);

export const useProjectLayoutContext = () => {
	const context = useContext(ProjectLayoutContext);
	if (!context) {
		return {
			setHasUnsavedChanges: () => {},
			setOnSave: () => {},
			scriptGenerationLayout: "grid1" as ScriptGenerationLayout,
			setScriptGenerationLayout: () => {},
		};
	}
	return context;
};
