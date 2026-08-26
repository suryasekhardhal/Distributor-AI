import dotenv from "dotenv";
import mongoose from "mongoose";

import { Company } from "../models/company.model.js";
import {DB_NAME} from "../constants.js"

import {
    confirmOrder,
} from "../services/orderConfirmation.service.js";

dotenv.config();

async function testOrderConfirmation() {
    try {
        await mongoose.connect(
           `${process.env.MONGO_DB_URI}/${DB_NAME}`
        );

        const company =
            await Company.findOne({
                name: "Demo Distributor",
            });

        // -----------------------------------------
        // CONFIRM ORDER
        // -----------------------------------------

        const result =
            await confirmOrder({
                companyId:
                    company._id,

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

                notes:
                    "Confirmed through test flow",
            });

        console.log(
            "\nORDER CONFIRMATION RESULT:"
        );

        console.dir(
            result,
            { depth: null }
        );

    } catch (error) {
        console.error(
            "\nOrder confirmation test failed:",
            error
        );
    } finally {
        await mongoose.disconnect();
    }
}

testOrderConfirmation();