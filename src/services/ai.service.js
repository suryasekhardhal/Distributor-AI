import { parseDistributorMessage } from "./gemini.service.js";

import { executeAICommand } from "./aiCommandExecutor.service.js";

import {
    buildOrderConfirmationMessage,
} from "./whatsappMessage.service.js";

import { savePendingConfirmation } from "./conversation.service.js";

export async function processDistributorMessage({
    companyId,
    customerPhone,
    message,
}) {
    if (!companyId) {
        throw new Error("companyId is required");
    }

    if (!customerPhone) {
        throw new Error(
            "customerPhone is required"
        );
    }

    if (
        !message ||
        typeof message !== "string"
    ) {
        throw new Error(
            "message must be a non-empty string"
        );
    }

    const command =
        await parseDistributorMessage(
            message
        );

    // -----------------------------------------
    // TRUST CHANNEL IDENTITY
    // -----------------------------------------

    command.customerPhone =
        customerPhone;

    const result =
        await executeAICommand({
            companyId,
            command,
        });

        if (
    command.intent ===
        "create_order" &&
    result.status ===
        "requires_confirmation"
) {
    const pending =
        await savePendingConfirmation({
            companyId,

            customerPhone,

            command,

            preview:
                result.preview ||
                result,
        });

    const confirmationMessage =
        buildOrderConfirmationMessage({
            customerName:
                result.customer?.name ||
                "Customer",

            preview:
                result.preview ||
                result,

            confirmationId:
                pending.confirmationId,
        });

    return {
        command,

        result,

        confirmation: {
            confirmationId:
                pending.confirmationId,

            message:
                confirmationMessage,
        },
    };
}

    return {
        command,
        result,
    };
}