import express, {Application} from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import {createServer} from "http";
import connectDatabase from "./src/utils/connectDB";
import apiConfig from "./src/configs/apiConfig";
import {errorHandler, notFound} from "./src/middlewares/errorHandler";
import {corsOptions} from "./src/configs/corsConfig";
import {startTransactionCleanupScheduler} from "./src/utils/transactionCleanup";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({extended: true, limit: "10mb"}));

app.use(express.static(path.join(__dirname, "public")));

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

const startServer = async () => {
	try {
		await connectDatabase();

		startTransactionCleanupScheduler();

		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}`);
		});
	} catch (error) {
		console.error("Failed to start server:", error);
		process.exit(1);
	}
};

startServer();
