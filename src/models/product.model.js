import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
    {
        companyId: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        sku: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        category: {
            type: String,
            trim: true,
        },

        unit: {
            type: String,
            required: true,
            trim: true,
        },

        sellingPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        costPrice: {
            type: Number,
            min: 0,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

productSchema.index(
    { companyId: 1, sku: 1 },
    { unique: true }
);

export const Product = mongoose.model("Product", productSchema);