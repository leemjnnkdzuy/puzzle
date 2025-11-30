import mongoose, {Schema, Document} from "mongoose";

export interface IScriptGenerationProject extends Document {
	title: string;
	description: string;
	thumbnail?: string;
	userId: mongoose.Types.ObjectId;
	status: "pending" | "processing" | "completed" | "failed";
	// Script generation specific fields
	scriptContent?: string;
	scriptLanguage?: string;
	videoUrl?: string;
	videoDuration?: number;
	generationSettings?: {
		tone?: string;
		style?: string;
		length?: string;
	};
	createdAt: Date;
	updatedAt: Date;
}

const ScriptGenerationProjectSchema: Schema = new Schema(
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
		scriptLanguage: {
			type: String,
			trim: true,
		},
		videoUrl: {
			type: String,
		},
		videoDuration: {
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
	},
	{
		timestamps: true,
	}
);

// Index for efficient queries
ScriptGenerationProjectSchema.index({userId: 1, createdAt: -1});
ScriptGenerationProjectSchema.index({userId: 1, status: 1});

const ScriptGenerationProject = mongoose.model<IScriptGenerationProject>(
	"ScriptGenerationProject",
	ScriptGenerationProjectSchema
);

export default ScriptGenerationProject;

