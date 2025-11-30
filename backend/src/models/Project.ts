import mongoose, {Schema, Document} from "mongoose";

export interface IProjectItem {
	projectId: mongoose.Types.ObjectId;
	type: "script_generation" | "script_voice" | "full_service";
}

export interface IProject extends Document {
	userId: mongoose.Types.ObjectId;
	projects: IProjectItem[];
	createdAt: Date;
	updatedAt: Date;
}

const ProjectItemSchema = new Schema(
	{
		projectId: {
			type: Schema.Types.ObjectId,
			required: [true, "Project ID is required"],
		},
		type: {
			type: String,
			enum: ["script_generation", "script_voice", "full_service"],
			required: [true, "Project type is required"],
		},
	},
	{_id: false}
);

const ProjectSchema: Schema = new Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "User ID is required"],
			unique: true,
			index: true,
		},
		projects: {
			type: [ProjectItemSchema],
			default: [],
		},
	},
	{
		timestamps: true,
	}
);

ProjectSchema.index({userId: 1});
ProjectSchema.index({"projects.projectId": 1});
ProjectSchema.index({"projects.type": 1});

const Project = mongoose.model<IProject>("Project", ProjectSchema);

export default Project;
