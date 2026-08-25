import mongoose, { Schema } from "mongoose";

const inventorySchema = new Schema(
    {
        companyId: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true,
        },

        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true,
        },

        quantity: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },

        reservedQuantity: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

inventorySchema.index(
    { companyId: 1, productId: 1 },
    { unique: true }
);

export const Inventory = mongoose.model("Inventory", inventorySchema);