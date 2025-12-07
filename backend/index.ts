import path from "path";
import fs from "fs";

try {
	const moduleAlias = require("module-alias");
	let srcPath = path.join(__dirname, "src");

	if (!fs.existsSync(srcPath)) {
		srcPath = path.join(__dirname, "..", "src");
		if (!fs.existsSync(srcPath)) {
			srcPath = path.join(__dirname, "..", "backend", "src");
		}
	}

	moduleAlias.addAliases({
		"@": srcPath,
		"@/configs": path.join(srcPath, "configs"),
		"@/controllers": path.join(srcPath, "controllers"),
		"@/middlewares": path.join(srcPath, "middlewares"),
		"@/models": path.join(srcPath, "models"),
		"@/routes": path.join(srcPath, "routes"),
		"@/utils": path.join(srcPath, "utils"),
		"@/validators": path.join(srcPath, "validators"),
	});

	console.log(
		`Path aliases registered successfully. srcPath: ${srcPath}, __dirname: ${__dirname}`
	);
} catch (error) {
	console.error("Failed to register path aliases:", error);
	try {
		require("tsconfig-paths/register");
		console.log("Using tsconfig-paths as fallback");
	} catch (tsError) {
		console.error("Both module-alias and tsconfig-paths failed:", tsError);
	}
}

import express, {Application} from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
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

try {
	const publicPath = path.join(__dirname, "public");
	const fs = require("fs");
	if (fs.existsSync(publicPath)) {
		app.use(express.static(publicPath));
	}
} catch (error) {
	// Ignore if public directory doesn't exist
}

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

if (process.env.VERCEL !== "1") {
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
}

export default app;
