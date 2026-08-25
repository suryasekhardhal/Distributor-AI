import mongoose, { Schema } from "mongoose";

const orderItemSchema = new Schema(
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
            index: true,
        },

        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        productName: {
            type: String,
            required: true,
            trim: true,
        },

        sku: {
            type: String,
            required: true,
            trim: true,
        },

        quantity: {
            type: Number,
            required: true,
            min: 0.01,
        },

        unit: {
            type: String,
            required: true,
            trim: true,
        },

        unitPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        totalPrice: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

export const OrderItem = mongoose.model(
    "OrderItem",
    orderItemSchema
);