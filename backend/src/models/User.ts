import mongoose, {Schema, Document} from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
	username: string;
	email: string;
	password: string;
	first_name: string;
	last_name: string;
	isEmailVerified: boolean;
	verificationCode?: string;
	verificationCodeExpires?: Date;
	resetPasswordToken?: string;
	resetPasswordExpires?: Date;
	refreshToken?: string;
	refreshTokenExpires?: Date;
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
