import crypto from "crypto";

import {
    Conversation,
} from "../models/conversation.model.js";

const CONFIRMATION_TTL_MS =
    15 * 60 * 1000;

export async function getConversation({
    companyId,
    customerPhone,
}) {
    return Conversation.findOne({
        companyId,
        customerPhone,
    });
}

export async function savePendingConfirmation({
    companyId,
    customerPhone,
    command,
    preview,
}) {
    const confirmationId =
        crypto.randomUUID();

    const expiresAt =
        new Date(
            Date.now() +
                CONFIRMATION_TTL_MS
        );

    const conversation =
        await Conversation.findOneAndUpdate(
            {
                companyId,
                customerPhone,
            },
            {
                $set: {
                    state:
                        "awaiting_confirmation",

                    confirmationId,

                    pendingCommand:
                        command,

                    pendingPreview:
                        preview,

                    expiresAt,
                },
            },
            {
                new: true,
                upsert: true,
            }
        );

    return {
        conversation,
        confirmationId,
        expiresAt,
    };
}

export async function getPendingConfirmation({
    companyId,
    customerPhone,
    confirmationId,
}) {
    return Conversation.findOne({
        companyId,
        customerPhone,
        confirmationId,
        state: "awaiting_confirmation",
        expiresAt: {
            $gt: new Date(),
        },
    });
}

export async function clearConversation({
    companyId,
    customerPhone,
}) {
    await Conversation.findOneAndUpdate(
        {
            companyId,
            customerPhone,
        },
        {
            $set: {
                state: "idle",
                confirmationId: null,
                pendingCommand: null,
                pendingPreview: null,
                expiresAt: null,
            },
        }
    );
}