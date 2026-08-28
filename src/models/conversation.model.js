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

        // -----------------------------------------
        // CONVERSATION STATE
        // -----------------------------------------

        state: {
            type: String,

            enum: [
                "idle",
                "awaiting_confirmation",
                "awaiting_address",
                "awaiting_payment",
            ],

            default: "idle",
        },

        // -----------------------------------------
        // ORDER CONFIRMATION
        // -----------------------------------------

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

        // -----------------------------------------
        // CONFIRMED ORDER
        // -----------------------------------------

        pendingOrderId: {
            type: Schema.Types.ObjectId,
            ref: "Order",
            default: null,
            index: true,
        },

        pendingInvoiceId: {
            type: Schema.Types.ObjectId,
            ref: "Invoice",
            default: null,
            index: true,
        },

        // -----------------------------------------
        // DELIVERY
        // -----------------------------------------

        deliveryAddress: {
            type: String,
            trim: true,
            default: null,
        },

        // -----------------------------------------
        // PAYMENT
        // -----------------------------------------

        paymentMethod: {
            type: String,

            enum: [
                "cod",
                "upi",
                "online",
                null,
            ],

            default: null,
        },

        // -----------------------------------------
        // EXPIRATION
        // -----------------------------------------

        expiresAt: {
            type: Date,
            default: null,
        },
    },

    {
        timestamps: true,
    }
);

// -----------------------------------------
// ONE CONVERSATION PER CUSTOMER / COMPANY
// -----------------------------------------

conversationSchema.index(
    {
        companyId: 1,
        customerPhone: 1,
    },
    {
        unique: true,
    }
);

// -----------------------------------------
// TTL
// -----------------------------------------

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