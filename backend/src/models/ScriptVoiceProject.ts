import mongoose, {Schema, Document} from "mongoose";

export interface IScriptVoiceProject extends Document {
	title: string;
	description: string;
	thumbnail?: string;
	userId: mongoose.Types.ObjectId;
	status: "pending" | "processing" | "completed" | "failed";
	scriptContent?: string;
	voiceSettings?: {
		voiceId?: string;
		voiceName?: string;
		speed?: number;
		pitch?: number;
		volume?: number;
	};
	audioUrl?: string;
	audioDuration?: number;
	language?: string;
	createdAt: Date;
	updatedAt: Date;
}

const ScriptVoiceProjectSchema: Schema = new Schema(
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
		audioUrl: {
			type: String,
		},
		audioDuration: {
			type: Number,
			min: 0,
		},
		language: {
			type: String,
			trim: true,
		},
	},
	{
		timestamps: true,
	}
);

ScriptVoiceProjectSchema.index({userId: 1, createdAt: -1});
ScriptVoiceProjectSchema.index({userId: 1, status: 1});

const ScriptVoiceProject = mongoose.model<IScriptVoiceProject>(
	"ScriptVoiceProject",
	ScriptVoiceProjectSchema
);

export default ScriptVoiceProject;

