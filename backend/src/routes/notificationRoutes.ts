import express from "express";
import {
	getNotifications,
	getUnreadCount,
	markAsRead,
	markAllAsRead,
	deleteNotification,
	streamNotifications,
} from "@/controllers/notificationController";
import {authenticate} from "@/middlewares/auth";

const router = express.Router();

router.get("/", authenticate, getNotifications);
router.get("/stream", authenticate, streamNotifications);
router.get("/unread-count", authenticate, getUnreadCount);
router.put("/:id/read", authenticate, markAsRead);
router.put("/read-all", authenticate, markAllAsRead);
router.delete("/:id", authenticate, deleteNotification);

export default router;
