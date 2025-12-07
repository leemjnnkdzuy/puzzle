import {RouterProvider} from "react-router-dom";
import {router} from "./routes";
import GlobalNotificationPopup from "./components/common/GlobalNotificationPopup";
import {useCreditSSE} from "./hooks/useCreditSSE";
import {useStorageSSE} from "./hooks/useStorageSSE";

const App = () => {
	useCreditSSE();
	useStorageSSE();

	return (
		<>
			<RouterProvider router={router} />
			<GlobalNotificationPopup />
		</>
	);
};


export default App;
