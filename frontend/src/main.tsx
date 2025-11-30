import {StrictMode, type ReactNode} from "react";
import {createRoot} from "react-dom/client";
import "@/styles/index.css";
import App from "./App.tsx";
import {LanguageProvider} from "@/contexts/LanguageContext";
import {ThemeProvider} from "@/contexts/ThemeContext.tsx";
import {useAuth} from "@/hooks/useAuth";

const ProvidersWrapper = ({children}: {children: ReactNode}) => {
	const {isAuthenticated} = useAuth();

	return (
		<ThemeProvider isAuthenticated={isAuthenticated}>
			<LanguageProvider isAuthenticated={isAuthenticated}>
				{children}
			</LanguageProvider>
		</ThemeProvider>
	);
};

export {ProvidersWrapper};

const rootElement = document.getElementById("root");

if (!rootElement) {
	throw new Error("Root element not found");
}

createRoot(rootElement).render(
	<StrictMode>
		<ProvidersWrapper>
			<App />
		</ProvidersWrapper>
	</StrictMode>
);
