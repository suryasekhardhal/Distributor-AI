import dotenv from "dotenv";

import {
    parseDistributorMessage,
} from "../services/gemini.service.js";


dotenv.config();

async function testGemini() {
    try {
        const messages = [
            "Ramesh needs 20 cartons of Parle G",

            "Ramesh confirmed the 20 cartons of Parle G",

            "Customer says send 10 cases of Coca Cola",

            "Ramesh paid 5000 rupees",
        ];

        for (const message of messages) {
            console.log(
                "\n================================"
            );

            console.log(
                "MESSAGE:"
            );

            console.log(message);

            const command =
                await parseDistributorMessage(
                    message
                );

            console.log(
                "\nAI COMMAND:"
            );

            console.dir(
                command,
                { depth: null }
            );
        }

    } catch (error) {
        console.error(
            "\nGemini test failed:",
            error
        );
    }
}

testGemini();