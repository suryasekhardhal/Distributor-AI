import dotenv from "dotenv";
import mongoose from "mongoose";

import { Company } from "../models/company.model.js";

import {
    buildOrderPreview,
} from "../services/orderPreview.service.js";
import {DB_NAME} from "../constants.js"

dotenv.config();

async function testOrderPreview() {
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
                "Demo company not found. Run npm run seed first."
            );
        }

        // -----------------------------------------
        // TEST 1
        // -----------------------------------------

        const preview =
            await buildOrderPreview({
                companyId: company._id,
                customerPhone: "919876543210",

                items: [
                    {
                        productName: "Parle G",
                        quantity: 20,
                        unit: "carton",
                    },
                ],
            });

        console.log(
            "\nVALID ORDER PREVIEW:"
        );

        console.dir(
            preview,
            { depth: null }
        );

        // -----------------------------------------
        // TEST 2
        // -----------------------------------------

        const insufficient =
            await buildOrderPreview({
                companyId: company._id,
                customerPhone: "919876543210",

                items: [
                    {
                        productName: "Parle G",
                        quantity: 100,
                        unit: "carton",
                    },
                ],
            });

        console.log(
            "\nINSUFFICIENT INVENTORY:"
        );

        console.dir(
            insufficient,
            { depth: null }
        );

        // -----------------------------------------
        // TEST 3
        // -----------------------------------------

        const missingProduct =
            await buildOrderPreview({
                companyId: company._id,
                customerPhone: "919876543210",

                items: [
                    {
                        productName: "Lays",
                        quantity: 10,
                        unit: "packet",
                    },
                ],
            });

        console.log(
            "\nMISSING PRODUCT:"
        );

        console.dir(
            missingProduct,
            { depth: null }
        );

    } catch (error) {
        console.error(
            "Order preview test failed:",
            error
        );
    } finally {
        await mongoose.disconnect();
    }
}

testOrderPreview();