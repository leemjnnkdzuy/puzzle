import express, {Application} from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import connectDatabase from "../backend/src/utils/connectDB";
import apiConfig from "../backend/src/configs/apiConfig";
import {errorHandler, notFound} from "../backend/src/middlewares/errorHandler";
import {corsOptions} from "../backend/src/configs/corsConfig";

dotenv.config();

const app: Application = express();

app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({extended: true, limit: "10mb"}));

app.use(express.static(path.join(__dirname, "../backend/public")));

let dbConnectionPromise: Promise<void> | null = null;
const ensureDatabaseConnection = async (): Promise<void> => {
	if (!dbConnectionPromise) {
		dbConnectionPromise = connectDatabase().catch((error) => {
			console.error("Database connection error:", error);
			dbConnectionPromise = null;
			throw error;
		});
	}
	return dbConnectionPromise;
};

app.use(async (req, res, next) => {
	try {
		await ensureDatabaseConnection();
	} catch (error) {
		console.error("Failed to ensure database connection:", error);
	}
	next();
});

app.get("/health", (req, res) => {
	res.json({
		success: true,
		message: "Server is running",
		timestamp: new Date().toISOString(),
	});
});

app.use("/api", apiConfig);

app.use(notFound);

app.use(errorHandler);

export default app;
