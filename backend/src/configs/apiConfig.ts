import express from "express";
import authRoutes from "@/routes/authRoutes";
import userRoutes from "@/routes/userRoutes";
import projectRoutes from "@/routes/projectRoutes";
import projectFileRoutes from "@/routes/projectFileRoutes";
import scriptGenerationRoutes from "@/routes/scriptGenerationRoutes";
import scriptVoiceRoutes from "@/routes/scriptVoiceRoutes";
import fullServiceRoutes from "@/routes/fullServiceRoutes";
import notificationRoutes from "@/routes/notificationRoutes";
import paymentRoutes from "@/routes/paymentRoutes";
import ttsRoutes from "@/routes/ttsRoutes";
import storageRoutes from "@/routes/storageRoutes";
import videoDownloadRoutes from "@/routes/videoDownloadRoutes";

const apiConfig = express.Router();

apiConfig.use("/auth", authRoutes);
apiConfig.use("/user", userRoutes);
apiConfig.use("/projects", projectRoutes);
apiConfig.use("/projects", projectFileRoutes);
apiConfig.use("/script-generation", scriptGenerationRoutes);
apiConfig.use("/script-voice", scriptVoiceRoutes);
apiConfig.use("/full-service", fullServiceRoutes);
apiConfig.use("/notifications", notificationRoutes);
apiConfig.use("/payments", paymentRoutes);
apiConfig.use("/tts", ttsRoutes);
apiConfig.use("/storage", storageRoutes);
apiConfig.use("/video-download", videoDownloadRoutes);

export default apiConfig;
