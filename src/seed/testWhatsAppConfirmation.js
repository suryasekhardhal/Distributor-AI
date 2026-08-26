import dotenv from "dotenv";
import mongoose from "mongoose";

import {
    Company,
} from "../models/company.model.js";

import { Customer } from "../models/customer.model.js";

import {
    processDistributorMessage,
} from "../services/ai.service.js";

import {
    handleWhatsAppAction,
} from "../services/whatsappAction.service.js";
import { DB_NAME } from "../constants.js";
dotenv.config();

async function testWhatsAppConfirmation() {
    try {
        await mongoose.connect(
            `${process.env.MONGO_DB_URI}/${DB_NAME}`
        );

        const company =
            await Company.findOne({
                name: "Demo Distributor",
            });

        if (!company) {
            throw new Error(
                "Demo company not found."
            );
        }

       const customerPhone = "919876543210";

let customer = await Customer.findOne({
    companyId: company._id,
    phone: customerPhone,
});

if (!customer) {
    customer = await Customer.create({
        companyId: company._id,
        name: "Test Customer",
        phone: customerPhone,
        isActive: true,
    });

    console.log("\nTEST CUSTOMER CREATED:");
    console.log(customer);
} else {
    console.log("\nTEST CUSTOMER FOUND:");
    console.log(customer);
}

        // -----------------------------------------
        // STEP 1 — CUSTOMER MESSAGE
        // -----------------------------------------

        console.log(
            "\n=============================="
        );

        console.log(
            "CUSTOMER MESSAGE:"
        );

        console.log(
            "Give me 20 cartons of Parle G"
        );

        const preview =
            await processDistributorMessage({
                companyId:
                    company._id,

                customerPhone,

                message:
                    "Give me 20 cartons of Parle G",
            });

        console.dir(
            preview,
            { depth: null }
        );

        // -----------------------------------------
        // STEP 2 — EXTRACT BUTTON ID
        // -----------------------------------------

        const confirmButton =
    preview.confirmation
        ?.message
        ?.interactive
        ?.action
        ?.buttons
        ?.find(
            (button) =>
                button.type === "reply" &&
                button.reply?.id?.startsWith(
                    "confirm_order:"
                )
        );

        if (!confirmButton) {
            throw new Error(
                "Confirm button was not generated."
            );
        }

        console.log(
            "\nCONFIRM BUTTON:"
        );

        console.dir(confirmButton, {
    depth: null,
});

        // -----------------------------------------
        // STEP 3 — SIMULATE BUTTON CLICK
        // -----------------------------------------

        console.log(
            "\n=============================="
        );

        console.log(
            "SIMULATING CONFIRM CLICK..."
        );

        const result =
            await handleWhatsAppAction({
                companyId:
                    company._id,

                customerPhone,

                actionId:
                    confirmButton.reply.id,
            });

        console.log(
            "\nFINAL RESULT:"
        );

        console.dir(
            result,
            { depth: null }
        );

    } catch (error) {
        console.error(
            "\nWhatsApp confirmation test failed:",
            error
        );
    } finally {
        await mongoose.disconnect();
    }
}

testWhatsAppConfirmation();