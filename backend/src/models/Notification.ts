import mongoose, {Schema, Document} from "mongoose";

export interface INotification extends Document {
	userId: mongoose.Types.ObjectId;
	title: string;
	message: string;
	type: "info" | "success" | "warning" | "error";
	read: boolean;
	link?: string;
	metadata?: Record<string, any>;
	createdAt: Date;
	updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "User ID is required"],
		},
		title: {
			type: String,
			required: [true, "Title is required"],
			trim: true,
		},
		message: {
			type: String,
			required: [true, "Message is required"],
			trim: true,
		},
		type: {
			type: String,
			enum: ["info", "success", "warning", "error"],
			default: "info",
		},
		read: {
			type: Boolean,
			default: false,
			index: true,
		},
		link: {
			type: String,
			trim: true,
		},
		metadata: {
			type: Schema.Types.Mixed,
			default: {},
		},
	},
	{
		timestamps: true,
	}
);

// Index for efficient queries
NotificationSchema.index({userId: 1, read: 1, createdAt: -1});

const Notification = mongoose.model<INotification>(
	"Notification",
	NotificationSchema
);

export default Notification;
