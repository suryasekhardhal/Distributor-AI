import "dotenv/config";

import {
    sendWhatsAppMessage,
} from "../services/whatsappApi.service.js";

import {
    buildTextMessage,
} from "../services/whatsappMessage.service.js";

//dotenv.config();

async function testWhatsAppSender() {
    try {
        const result =
            await sendWhatsAppMessage({
                to:
                    process.env.WHATSAPP_TEST_TO,

                message:
                    buildTextMessage({
                        text:
                            "Hello from AI Distributor MVP 🚀",
                    }),
            });

        console.log(
            "\nWhatsApp message sent:"
        );

        console.dir(
            result,
            { depth: null }
        );
    } catch (error) {
        console.error(
            "\nWhatsApp sender test failed:"
        );

        console.error(
            error.message
        );
    }
}

testWhatsAppSender();