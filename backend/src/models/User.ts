import mongoose, {Schema, Document} from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
	username: string;
	email: string;
	password: string;
	first_name: string;
	last_name: string;
	avatar?: string;
	bio?: string;
	isEmailVerified: boolean;
	verificationCode?: string;
	verificationCodeExpires?: Date;
	resetPasswordToken?: string;
	resetPasswordExpires?: Date;
	refreshToken?: string;
	refreshTokenExpires?: Date;
	theme?: "light" | "dark";
	language?: "en" | "vi";
	credit?: number;
	storageLimit?: number;
	storageUsed?: number;
	project?: mongoose.Types.ObjectId;
	notifications?: mongoose.Types.ObjectId[];
	socialLinks?: Array<{
		platform:
			| "website"
			| "facebook"
			| "tiktok"
			| "github"
			| "instagram"
			| "linkedin"
			| "youtube";
		url: string;
	}>;
	createdAt: Date;
	updatedAt: Date;
	comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
	{
		username: {
			type: String,
			required: [true, "Username is required"],
			unique: true,
			trim: true,
			lowercase: true,
			minlength: [6, "Username must be at least 6 characters"],
			match: [
				/^[a-z0-9_.-]+$/,
				"Username can only contain a-z, 0-9, underscore (_), hyphen (-) and dot (.)",
			],
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			trim: true,
			lowercase: true,
			match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
		},
		password: {
			type: String,
			required: [true, "Password is required"],
			minlength: [6, "Password must be at least 6 characters"],
			select: false,
		},
		first_name: {
			type: String,
			required: [true, "First name is required"],
			trim: true,
			minlength: [2, "First name must be at least 2 characters"],
		},
		last_name: {
			type: String,
			required: [true, "Last name is required"],
			trim: true,
			minlength: [2, "Last name must be at least 2 characters"],
		},
		avatar: {
			type: String,
		},
		bio: {
			type: String,
			trim: true,
			maxlength: [500, "Bio must not exceed 500 characters"],
		},
		isEmailVerified: {
			type: Boolean,
			default: false,
		},
		verificationCode: {
			type: String,
		},
		verificationCodeExpires: {
			type: Date,
		},
		resetPasswordToken: {
			type: String,
		},
		resetPasswordExpires: {
			type: Date,
		},
		refreshToken: {
			type: String,
			select: false,
		},
		refreshTokenExpires: {
			type: Date,
		},
		theme: {
			type: String,
			enum: ["light", "dark"],
			default: "light",
		},
		language: {
			type: String,
			enum: ["en", "vi"],
			default: "vi",
		},
		credit: {
			type: Number,
			default: 0,
			min: 0,
		},
		storageLimit: {
			type: Number,
			default: 2147483648,
			min: 0,
		},
		storageUsed: {
			type: Number,
			default: 0,
			min: 0,
		},
		project: {
			type: Schema.Types.ObjectId,
			ref: "Project",
		},
		notifications: {
			type: [Schema.Types.ObjectId],
			ref: "Notification",
			default: [],
		},
		socialLinks: {
			type: [
				{
					platform: {
						type: String,
						required: true,
						trim: true,
						enum: [
							"website",
							"facebook",
							"tiktok",
							"github",
							"instagram",
							"linkedin",
							"youtube",
						],
					},
					url: {
						type: String,
						required: true,
						trim: true,
					},
				},
			],
			default: [],
		},
	},
	{
		timestamps: true,
	}
);

UserSchema.pre("save", async function () {
	const user = this as any;

	if (!user.isModified("password")) {
		return;
	}

	try {
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(user.password as string, salt);
		user.password = hashedPassword;
	} catch (error) {
		throw error;
	}
});

UserSchema.methods.comparePassword = async function (
	candidatePassword: string
): Promise<boolean> {
	return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
