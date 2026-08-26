import "dotenv/config";
const WHATSAPP_API_VERSION =
    process.env.WHATSAPP_API_VERSION || "v23.0";

const WHATSAPP_PHONE_NUMBER_ID =
    process.env.WHATSAPP_PHONE_NUMBER_ID;

const WHATSAPP_ACCESS_TOKEN =
    process.env.WHATSAPP_ACCESS_TOKEN;

function getMessagesUrl() {
    if (!WHATSAPP_PHONE_NUMBER_ID) {
        throw new Error(
            "WHATSAPP_PHONE_NUMBER_ID is missing"
        );
    }

    return `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
}

function getHeaders() {
    if (!WHATSAPP_ACCESS_TOKEN) {
        throw new Error(
            "WHATSAPP_ACCESS_TOKEN is missing"
        );
    }

    return {
        Authorization:
            `Bearer ${WHATSAPP_ACCESS_TOKEN}`,

        "Content-Type":
            "application/json",
    };
}

export async function sendWhatsAppMessage({
    to,
    message,
}) {
    if (!to) {
        throw new Error(
            "WhatsApp recipient is required"
        );
    }

    if (!message) {
        throw new Error(
            "WhatsApp message is required"
        );
    }

    const response =
        await fetch(
            getMessagesUrl(),
            {
                method: "POST",

                headers:
                    getHeaders(),

                body: JSON.stringify({
                    messaging_product:
                        "whatsapp",

                    recipient_type:
                        "individual",

                    to,

                    ...message,
                }),
            }
        );

    const data =
        await response.json();

    if (!response.ok) {
        console.error(
            "WhatsApp API error:",
            data
        );

        throw new Error(
            data?.error?.message ||
                "Failed to send WhatsApp message"
        );
    }

    return data;
}