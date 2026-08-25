import mongoose, { Schema } from "mongoose";

const paymentAllocationSchema = new Schema(
    {
        companyId: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true,
        },

        paymentId: {
            type: Schema.Types.ObjectId,
            ref: "Payment",
            required: true,
            index: true,
        },

        invoiceId: {
            type: Schema.Types.ObjectId,
            ref: "Invoice",
            required: true,
            index: true,
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

export const PaymentAllocation = mongoose.model(
    "PaymentAllocation",
    paymentAllocationSchema
);