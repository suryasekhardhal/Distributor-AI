import mongoose, { Schema } from "mongoose";

const invoiceSchema = new Schema(
    {
        companyId: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true,
        },

        orderId: {
            type: Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            unique: true,
        },

        customerId: {
            type: Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
        },

        invoiceNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        amountPaid: {
            type: Number,
            default: 0,
            min: 0,
        },

        amountDue: {
            type: Number,
            required: true,
            min: 0,
        },

        status: {
            type: String,
            enum: [
                "unpaid",
                "partial",
                "paid",
                "cancelled",
            ],
            default: "unpaid",
        },
    },
    {
        timestamps: true,
    }
);

export const Invoice = mongoose.model(
    "Invoice",
    invoiceSchema
);