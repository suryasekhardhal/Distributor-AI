import dotenv from "dotenv";

dotenv.config();

const WEBHOOK_URL =
    "http://localhost:8000/api/v1/whatsapp/webhook";

async function sendFakeWhatsAppMessage(text) {
    console.log("\n==============================");
    console.log("SIMULATED WHATSAPP MESSAGE");
    console.log("==============================");
    console.log(text);

    const payload = {
        object: "whatsapp_business_account",

        entry: [
            {
                changes: [
                    {
                        field: "messages",

                        value: {
                            messaging_product: "whatsapp",

                            metadata: {
                                display_phone_number:
                                    "15556639843",

                                phone_number_id:
                                    process.env
                                        .WHATSAPP_PHONE_NUMBER_ID ||
                                    "TEST_PHONE_NUMBER_ID",
                            },

                            contacts: [
                                {
                                    profile: {
                                        name: "Ramesh",
                                    },

                                    wa_id:
                                        "919876543210",
                                },
                            ],

                            messages: [
                                {
                                    from: "919876543210",

                                    id:
                                        "fake-message-" +
                                        Date.now(),

                                    timestamp:
                                        Math.floor(
                                            Date.now() / 1000
                                        ).toString(),

                                    type: "text",

                                    text: {
                                        body: text,
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        ],
    };

    const response = await fetch(WEBHOOK_URL, {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
    });

    const data = await response.text();

    console.log("\nWEBHOOK RESPONSE:");
    console.log(response.status, data);
}

async function test() {
    try {
        await sendFakeWhatsAppMessage(
            "Give me 20 cartons of Parle G"
        );
    } catch (error) {
        console.error(
            "\nSimulator failed:"
        );

        console.error(error);
    }
}

test();