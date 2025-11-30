import mongoose, {Schema, Document} from "mongoose";

export interface IFullServiceProject extends Document {
	title: string;
	description: string;
	thumbnail?: string;
	userId: mongoose.Types.ObjectId;
	status: "pending" | "processing" | "completed" | "failed";
	scriptContent?: string;
	videoUrl?: string;
	audioUrl?: string;
	videoDuration?: number;
	audioDuration?: number;
	generationSettings?: {
		tone?: string;
		style?: string;
		length?: string;
	};
	voiceSettings?: {
		voiceId?: string;
		voiceName?: string;
		speed?: number;
		pitch?: number;
		volume?: number;
	};
	language?: string;
	processingSteps?: {
		scriptGeneration?: "pending" | "processing" | "completed" | "failed";
		voiceGeneration?: "pending" | "processing" | "completed" | "failed";
		videoGeneration?: "pending" | "processing" | "completed" | "failed";
	};
	createdAt: Date;
	updatedAt: Date;
}

const FullServiceProjectSchema: Schema = new Schema(
	{
		title: {
			type: String,
			required: [true, "Title is required"],
			trim: true,
			minlength: [1, "Title must be at least 1 character"],
			maxlength: [200, "Title must not exceed 200 characters"],
		},
		description: {
			type: String,
			required: [true, "Description is required"],
			trim: true,
			maxlength: [1000, "Description must not exceed 1000 characters"],
		},
		thumbnail: {
			type: String,
		},
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "User ID is required"],
			index: true,
		},
		status: {
			type: String,
			enum: ["pending", "processing", "completed", "failed"],
			default: "pending",
		},
		scriptContent: {
			type: String,
			trim: true,
		},
		videoUrl: {
			type: String,
		},
		audioUrl: {
			type: String,
		},
		videoDuration: {
			type: Number,
			min: 0,
		},
		audioDuration: {
			type: Number,
			min: 0,
		},
		generationSettings: {
			tone: {
				type: String,
				trim: true,
			},
			style: {
				type: String,
				trim: true,
			},
			length: {
				type: String,
				trim: true,
			},
		},
		voiceSettings: {
			voiceId: {
				type: String,
				trim: true,
			},
			voiceName: {
				type: String,
				trim: true,
			},
			speed: {
				type: Number,
				min: 0.5,
				max: 2.0,
				default: 1.0,
			},
			pitch: {
				type: Number,
				min: -20,
				max: 20,
				default: 0,
			},
			volume: {
				type: Number,
				min: 0,
				max: 100,
				default: 100,
			},
		},
		language: {
			type: String,
			trim: true,
		},
		processingSteps: {
			scriptGeneration: {
				type: String,
				enum: ["pending", "processing", "completed", "failed"],
				default: "pending",
			},
			voiceGeneration: {
				type: String,
				enum: ["pending", "processing", "completed", "failed"],
				default: "pending",
			},
			videoGeneration: {
				type: String,
				enum: ["pending", "processing", "completed", "failed"],
				default: "pending",
			},
		},
	},
	{
		timestamps: true,
	}
);

// Index for efficient queries
FullServiceProjectSchema.index({userId: 1, createdAt: -1});
FullServiceProjectSchema.index({userId: 1, status: 1});

const FullServiceProject = mongoose.model<IFullServiceProject>(
	"FullServiceProject",
	FullServiceProjectSchema
);

export default FullServiceProject;

