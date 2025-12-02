import mongoose, {Schema, Document} from "mongoose";

export interface ITokenBlacklist extends Document {
	tokenHash?: string;
	sessionId?: string;
	userId: mongoose.Types.ObjectId;
	revokedAt: Date;
	expiresAt: Date;
	createdAt: Date;
	updatedAt: Date;
}

const TokenBlacklistSchema: Schema = new Schema(
	{
		tokenHash: {
			type: String,
		},
		sessionId: {
			type: String,
		},
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		revokedAt: {
			type: Date,
			default: Date.now,
			required: true,
		},
		expiresAt: {
			type: Date,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

TokenBlacklistSchema.index({tokenHash: 1}, {sparse: true});
TokenBlacklistSchema.index({sessionId: 1}, {sparse: true});
TokenBlacklistSchema.index({userId: 1});
TokenBlacklistSchema.index({expiresAt: 1}, {expireAfterSeconds: 0});

const TokenBlacklist = mongoose.model<ITokenBlacklist>(
	"TokenBlacklist",
	TokenBlacklistSchema
);

export default TokenBlacklist;
