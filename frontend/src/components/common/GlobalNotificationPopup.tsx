import {useState, useEffect} from "react";
import {
	getNotifications,
	subscribe,
	removeNotification,
} from "@/hooks/useGlobalNotificationPopup";
import {AiFillCloseCircle} from "react-icons/ai";
import {BiErrorCircle} from "react-icons/bi";
import {BsCheckCircleFill} from "react-icons/bs";
import {IoWarning} from "react-icons/io5";
import {AiFillInfoCircle} from "react-icons/ai";

type NotificationType = "success" | "error" | "info" | "warning";

interface Notification {
	id: string;
	message: string;
	type: NotificationType;
}

const icons = {
	error: <BiErrorCircle />,
	success: <BsCheckCircleFill />,
	warning: <IoWarning />,
	info: <AiFillInfoCircle />,
};

const typeStyles = {
	error: "border-l-4 border-[#ff4d4f]",
	success: "border-l-4 border-[#52c41a]",
	warning: "border-l-4 border-[#faad14]",
	info: "border-l-4 border-[#1890ff]",
};

const iconColors = {
	error: "text-[#ff4d4f]",
	success: "text-[#52c41a]",
	warning: "text-[#faad14]",
	info: "text-[#1890ff]",
};

function PopupNotification({
	message,
	type = "error",
	onClose,
}: {
	message: string;
	type?: NotificationType;
	onClose: () => void;
}) {
	return (
		<div className='mr-0 mb-0 pointer-events-auto'>
			<div
				className={`relative w-full min-w-[300px] max-w-[400px] py-4 px-5 rounded-xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.12)] flex items-center gap-3 animate-slideInRight pointer-events-auto ${typeStyles[type]}`}
			>
				<div
					className={`text-[22px] shrink-0 [&_svg]:block ${iconColors[type]}`}
				>
					{icons[type]}
				</div>
				<p className='m-0 flex-grow text-sm leading-[1.6] text-[#333] font-medium'>
					{message}
				</p>
				<button
					className='bg-transparent shadow-none border-none cursor-pointer mr-2 text-[#999] leading-none transition-all duration-200 rounded-[32px] w-6 h-6 flex items-center justify-center p-0 hover:text-[#666]'
					onClick={onClose}
				>
					<AiFillCloseCircle size={24} />
				</button>
			</div>
		</div>
	);
}

export default function GlobalNotificationPopup() {
	const [notifications, setNotifications] = useState<Notification[]>([]);

	useEffect(() => {
		setTimeout(() => {
			setNotifications(getNotifications());
		}, 0);

		const unsubscribe = subscribe(() => {
			setNotifications(getNotifications());
		});

		return unsubscribe;
	}, []);

	const handleClose = (id: string) => {
		removeNotification(id);
	};

	if (notifications.length === 0) {
		return null;
	}

	return (
		<div className='fixed top-5 right-5 z-[9999] flex flex-col items-end gap-3 pointer-events-none'>
			{notifications.map((notification) => (
				<PopupNotification
					key={notification.id}
					message={notification.message}
					type={notification.type}
					onClose={() => handleClose(notification.id)}
				/>
			))}
		</div>
	);
}
