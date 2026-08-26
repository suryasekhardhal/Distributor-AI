import {
    getPendingConfirmation,
    clearConversation,
} from "./conversation.service.js";

import {
    executeAICommand,
} from "./aiCommandExecutor.service.js";

export async function handleWhatsAppAction({
    companyId,
    customerPhone,
    actionId,
}) {
    if (!companyId) {
        throw new Error(
            "companyId is required"
        );
    }

    if (!customerPhone) {
        throw new Error(
            "customerPhone is required"
        );
    }

    if (!actionId) {
        throw new Error(
            "actionId is required"
        );
    }

    const [action, confirmationId] =
        actionId.split(":");

    if (
        !action ||
        !confirmationId
    ) {
        return {
            status: "invalid_action",
            message:
                "Invalid WhatsApp action.",
        };
    }

    const conversation =
        await getPendingConfirmation({
            companyId,
            customerPhone,
            confirmationId,
        });

    if (!conversation) {
        return {
            status:
                "confirmation_expired",

            message:
                "This order confirmation has expired or is no longer valid.",
        };
    }

    // -----------------------------------------
    // CANCEL
    // -----------------------------------------

    if (
        action ===
        "cancel_order"
    ) {
        await clearConversation({
            companyId,
            customerPhone,
        });

        return {
            status: "cancelled",

            message:
                "Order cancelled.",
        };
    }

    // -----------------------------------------
    // CONFIRM
    // -----------------------------------------

    if (
        action ===
        "confirm_order"
    ) {
        const command = {
            ...conversation.pendingCommand,

            intent:
                "confirm_order",

            customerPhone,
        };

        const result =
            await executeAICommand({
                companyId,
                command,
            });

        await clearConversation({
            companyId,
            customerPhone,
        });

        return result;
    }

    return {
        status: "invalid_action",

        message:
            "Unsupported WhatsApp action.",
    };
}