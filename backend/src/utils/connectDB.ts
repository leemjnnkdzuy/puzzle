import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

let cachedConnection: typeof mongoose | null = null;

const connectDatabase = async (): Promise<void> => {
	if (cachedConnection && mongoose.connection.readyState === 1) {
		return;
	}

	try {
		const username = encodeURIComponent(process.env.MONGODB_USER || "");
		const password = encodeURIComponent(process.env.MONGODB_PASSWORD || "");
		const cluster = encodeURIComponent(process.env.MONGODB_CLUSTER || "");
		const database = encodeURIComponent(process.env.MONGODB_DATABASE || "");

		const uri = `mongodb+srv://${username}:${password}@${cluster}/${database}?retryWrites=true&w=majority`;

		if (!cachedConnection || mongoose.connection.readyState === 0) {
			cachedConnection = await mongoose.connect(uri, {
				serverSelectionTimeoutMS: 5000,
				socketTimeoutMS: 45000,
			});
			console.log("MongoDB connected successfully");
		}
	} catch (error) {
		console.error("MongoDB connection error:", error);
		if (process.env.VERCEL !== "1") {
			process.exit(1);
		}
		throw error;
	}
};

export default connectDatabase;
