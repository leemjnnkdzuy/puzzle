import mongoose, {Schema, Document} from "mongoose";

export interface ITTSHistory extends Document {
	userId: mongoose.Types.ObjectId;
	text: string;
	voiceId: string;
	voiceName?: string;
	language: string;
	speed: number;
	pitch: number;
	audioUrl: string;
	duration?: number;
	cost: number;
	createdAt: Date;
	updatedAt: Date;
}

const TTSHistorySchema: Schema = new Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "User ID is required"],
			index: true,
		},
		text: {
			type: String,
			required: [true, "Text is required"],
			trim: true,
			maxlength: [5000, "Text cannot exceed 5000 characters"],
		},
		voiceId: {
			type: String,
			required: [true, "Voice ID is required"],
			trim: true,
		},
		voiceName: {
			type: String,
			trim: true,
		},
		language: {
			type: String,
			required: [true, "Language is required"],
			trim: true,
		},
		speed: {
			type: Number,
			required: true,
			min: [0.5, "Speed must be at least 0.5"],
			max: [2.0, "Speed cannot exceed 2.0"],
			default: 1.0,
		},
		pitch: {
			type: Number,
			required: true,
			min: [-12, "Pitch must be at least -12"],
			max: [12, "Pitch cannot exceed 12"],
			default: 0,
		},
		audioUrl: {
			type: String,
			required: [true, "Audio URL is required"],
			trim: true,
		},
		duration: {
			type: Number,
			min: [0, "Duration must be positive"],
		},
		cost: {
			type: Number,
			required: [true, "Cost is required"],
			min: [0, "Cost must be positive"],
		},
	},
	{
		timestamps: true,
	}
);

TTSHistorySchema.index({userId: 1, createdAt: -1});
TTSHistorySchema.index({createdAt: -1});

const TTSHistory = mongoose.model<ITTSHistory>("TTSHistory", TTSHistorySchema);

export default TTSHistory;
