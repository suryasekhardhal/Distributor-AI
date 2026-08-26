import {
    sendWhatsAppMessage,
} from "./whatsappApi.service.js";

import {
    buildTextMessage,
} from "./whatsappMessage.service.js";

export async function sendTextToWhatsApp({
    to,
    text,
}) {
    const message =
        buildTextMessage({
            text,
        });

    return sendWhatsAppMessage({
        to,
        message,
    });
}