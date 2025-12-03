import express from "express";
import authRoutes from "@/routes/authRoutes";
import userRoutes from "@/routes/userRoutes";
import projectRoutes from "@/routes/projectRoutes";
import scriptGenerationRoutes from "@/routes/scriptGenerationRoutes";
import scriptVoiceRoutes from "@/routes/scriptVoiceRoutes";
import fullServiceRoutes from "@/routes/fullServiceRoutes";
import notificationRoutes from "@/routes/notificationRoutes";
import paymentRoutes from "@/routes/paymentRoutes";
import ttsRoutes from "@/routes/ttsRoutes";

const apiConfig = express.Router();

apiConfig.use("/auth", authRoutes);
apiConfig.use("/user", userRoutes);
apiConfig.use("/projects", projectRoutes);
apiConfig.use("/script-generation", scriptGenerationRoutes);
apiConfig.use("/script-voice", scriptVoiceRoutes);
apiConfig.use("/full-service", fullServiceRoutes);
apiConfig.use("/notifications", notificationRoutes);
apiConfig.use("/payments", paymentRoutes);
apiConfig.use("/tts", ttsRoutes);

export default apiConfig;
