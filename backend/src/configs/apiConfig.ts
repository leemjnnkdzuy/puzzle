import express from "express";
import authRoutes from "@/routes/authRoutes";

const apiConfig = express.Router();

apiConfig.use("/auth", authRoutes);

export default apiConfig;
