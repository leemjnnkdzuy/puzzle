import express from "express";
import authRoutes from "@/routes/authRoutes";
import userRoutes from "@/routes/userRoutes";

const apiConfig = express.Router();

apiConfig.use("/auth", authRoutes);
apiConfig.use("/user", userRoutes);

export default apiConfig;
