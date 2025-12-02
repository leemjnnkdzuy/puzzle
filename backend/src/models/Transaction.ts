import mongoose, {Schema, Document} from "mongoose";

export interface ITransaction extends Document {
	userId: mongoose.Types.ObjectId;
	amount: number;
	credit: number;
	paymentMethod: "payos" | "paypal" | "bitcoin" | "visa";
	status: "pending" | "paid" | "completed" | "failed";
	referenceCode?: string;
	payosOrderCode?: number;
	payosTransactionId?: string;
	gateway?: string;
	transactionDate?: Date;
	qrCodeUrl?: string;
	accountNumber?: string;
	accountName?: string;
	metadata?: Record<string, any>;
	createdAt: Date;
	updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "User ID is required"],
		},
		amount: {
			type: Number,
			required: [true, "Amount is required"],
			min: [0, "Amount must be positive"],
		},
		credit: {
			type: Number,
			required: [true, "Credit is required"],
			min: [0, "Credit must be positive"],
		},
		paymentMethod: {
			type: String,
			enum: ["payos", "paypal", "bitcoin", "visa"],
			required: [true, "Payment method is required"],
		},
		status: {
			type: String,
			enum: ["pending", "paid", "completed", "failed"],
			default: "pending",
			index: true,
		},
		referenceCode: {
			type: String,
			trim: true,
		},
		payosOrderCode: {
			type: Number,
		},
		payosTransactionId: {
			type: String,
		},
		gateway: {
			type: String,
			trim: true,
		},
		transactionDate: {
			type: Date,
		},
		qrCodeUrl: {
			type: String,
			trim: true,
		},
		accountNumber: {
			type: String,
			trim: true,
		},
		accountName: {
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

TransactionSchema.index({userId: 1, status: 1, createdAt: -1});
TransactionSchema.index({referenceCode: 1});
TransactionSchema.index({payosOrderCode: 1});
TransactionSchema.index({payosTransactionId: 1});

const Transaction = mongoose.model<ITransaction>(
	"Transaction",
	TransactionSchema
);

export default Transaction;
