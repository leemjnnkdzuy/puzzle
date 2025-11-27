import {RouterProvider} from "react-router-dom";
import {router} from "./routes";
import GlobalNotificationPopup from "./components/common/GlobalNotificationPopup";

const App = () => {
	return (
		<>
			<RouterProvider router={router} />
			<GlobalNotificationPopup />
		</>
	);
};

App.displayName = "App";
export default App;
