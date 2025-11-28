import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import "@/styles/index.css";
import App from "./App.tsx";
import {LanguageProvider} from "./contexts/LanguageContext.tsx";
import ErrorBoundary from "./components/common/ErrorBoundary.tsx";

const rootElement = document.getElementById("root");

if (!rootElement) {
	throw new Error("Root element not found");
}

createRoot(rootElement).render(
	<StrictMode>
		<ErrorBoundary>
			<LanguageProvider>
				<App />
			</LanguageProvider>
		</ErrorBoundary>
	</StrictMode>
);
