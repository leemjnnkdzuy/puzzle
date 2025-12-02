import mongoose, {Schema, Document} from "mongoose";

export interface ILoginHistory extends Document {
	user: mongoose.Types.ObjectId;
	deviceInfo: {
		userAgent: string;
		platform?: string;
		browser?: string;
		device?: string;
		os?: string;
	};
	ipAddress: string;
	location?: {
		country?: string;
		city?: string;
	};
	loginAt: Date;
	logoutAt?: Date;
	isActive: boolean;
	sessionId?: string;
	createdAt: Date;
	updatedAt: Date;
}

const LoginHistorySchema: Schema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		deviceInfo: {
			userAgent: {
				type: String,
				required: true,
			},
			platform: {
				type: String,
			},
			browser: {
				type: String,
			},
			device: {
				type: String,
			},
			os: {
				type: String,
			},
		},
		ipAddress: {
			type: String,
			required: true,
		},
		location: {
			country: {
				type: String,
			},
			city: {
				type: String,
			},
		},
		loginAt: {
			type: Date,
			default: Date.now,
			required: true,
		},
		logoutAt: {
			type: Date,
		},
		isActive: {
			type: Boolean,
			default: true,
			index: true,
		},
		sessionId: {
			type: String,
			index: true,
		},
	},
	{
		timestamps: true,
	}
);

LoginHistorySchema.index({user: 1, isActive: 1});
LoginHistorySchema.index({user: 1, loginAt: -1});

const LoginHistory = mongoose.model<ILoginHistory>(
	"LoginHistory",
	LoginHistorySchema
);

export default LoginHistory;
