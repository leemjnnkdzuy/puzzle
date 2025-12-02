import {RouterProvider} from "react-router-dom";
import {router} from "./routes";
import GlobalNotificationPopup from "./components/common/GlobalNotificationPopup";
import {useCreditSSE} from "./hooks/useCreditSSE";

const App = () => {
	useCreditSSE();

	return (
		<>
			<RouterProvider router={router} />
			<GlobalNotificationPopup />
		</>
	);
};

App.displayName = "App";
export default App;
