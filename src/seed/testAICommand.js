import dotenv from "dotenv";
import mongoose from "mongoose";

import { Company } from "../models/company.model.js";

import {
    executeAICommand,
} from "../services/aiCommandExecutor.service.js";

import {DB_NAME} from "../constants.js"

dotenv.config();

async function testAICommand() {
    try {
        await mongoose.connect(
            `${process.env.MONGO_DB_URI}/${DB_NAME}`
        );

        const company =
            await Company.findOne({
                name: "Demo Distributor",
            });

        // -----------------------------------------
        // TEST 1: CREATE ORDER
        // -----------------------------------------

        const createCommand =
            await executeAICommand({
                companyId:
                    company._id,

                command: {
                    intent:
                        "create_order",

                    customerPhone:
                        "919876543210",

                    items: [
                        {
                            productName:
                                "Parle G",

                            quantity: 20,

                            unit: "carton",
                        },
                    ],
                },
            });

        console.log(
            "\nCREATE ORDER COMMAND:"
        );

        console.dir(
            createCommand,
            { depth: null }
        );

        // -----------------------------------------
        // TEST 2: INVALID COMMAND
        // -----------------------------------------

        const invalidCommand =
            await executeAICommand({
                companyId:
                    company._id,

                command: {
                    intent:
                        "delete_everything",
                },
            });

        console.log(
            "\nINVALID COMMAND:"
        );

        console.dir(
            invalidCommand,
            { depth: null }
        );

    } catch (error) {
        console.error(
            "\nAI command test failed:",
            error
        );
    } finally {
        await mongoose.disconnect();
    }
}

testAICommand();