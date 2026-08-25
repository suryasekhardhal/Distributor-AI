import mongoose, { Schema } from "mongoose";

const paymentSchema = new Schema(
    {
        companyId: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true,
        },

        invoiceId: {
            type: Schema.Types.ObjectId,
            ref: "Invoice",
            required: true,
            index: true,
        },

        orderId: {
            type: Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            index: true,
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        gateway: {
            type: String,
            required: true,
            trim: true,
        },

        gatewayPaymentId: {
            type: String,
            required: true,
            trim: true,
        },

        status: {
            type: String,
            enum: [
                "pending",
                "successful",
                "failed",
            ],
            default: "pending",
        },

        paidAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

paymentSchema.index(
    { gateway: 1, gatewayPaymentId: 1 },
    { unique: true }
);

export const Payment = mongoose.model(
    "Payment",
    paymentSchema
);