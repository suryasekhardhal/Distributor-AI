import mongoose, { Schema } from "mongoose";

const conversationSchema = new Schema(
    {
        companyId: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true,
        },

        customerPhone: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        state: {
            type: String,
            enum: [
                "idle",
                "awaiting_confirmation",
            ],
            default: "idle",
        },

        confirmationId: {
            type: String,
            default: null,
            index: true,
        },

        pendingCommand: {
            type: Schema.Types.Mixed,
            default: null,
        },

        pendingPreview: {
            type: Schema.Types.Mixed,
            default: null,
        },

        expiresAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

conversationSchema.index(
    {
        companyId: 1,
        customerPhone: 1,
    },
    {
        unique: true,
    }
);

conversationSchema.index(
    {
        expiresAt: 1,
    },
    {
        expireAfterSeconds: 0,
    }
);

export const Conversation =
    mongoose.model(
        "Conversation",
        conversationSchema
    );