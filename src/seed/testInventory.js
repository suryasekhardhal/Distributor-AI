import dotenv from "dotenv";
import mongoose from "mongoose";

import { Company } from "../models/company.model.js";
import { Product } from "../models/product.model.js";
import {
    validateInventory,
} from "../services/inventory.service.js";
import {DB_NAME} from "../constants.js"

dotenv.config();

async function testInventory() {
    try {
        await mongoose.connect(`${process.env.MONGO_DB_URI}/${DB_NAME}`);

        const company = await Company.findOne({
            name: "Demo Distributor",
        });

        if (!company) {
            throw new Error(
                "Demo company not found. Run npm run seed first."
            );
        }

        const product = await Product.findOne({
            companyId: company._id,
            sku: "PARLE-G-001",
        });

        if (!product) {
            throw new Error(
                "Parle-G product not found."
            );
        }

        // -----------------------------------------
        // TEST 1: AVAILABLE STOCK
        // -----------------------------------------

        const available = await validateInventory({
            companyId: company._id,
            productId: product._id,
            requestedQuantity: 20,
        });

        console.log(
            "\n20 CARTONS REQUEST:"
        );

        console.log(available);

        // -----------------------------------------
        // TEST 2: INSUFFICIENT STOCK
        // -----------------------------------------

        const insufficient =
            await validateInventory({
                companyId: company._id,
                productId: product._id,
                requestedQuantity: 100,
            });

        console.log(
            "\n100 CARTONS REQUEST:"
        );

        console.log(insufficient);

        // -----------------------------------------
        // TEST 3: INVALID QUANTITY
        // -----------------------------------------

        try {
            await validateInventory({
                companyId: company._id,
                productId: product._id,
                requestedQuantity: 0,
            });
        } catch (error) {
            console.log(
                "\nINVALID QUANTITY:"
            );

            console.log(error.message);
        }

    } catch (error) {
        console.error(
            "Inventory test failed:",
            error
        );
    } finally {
        await mongoose.disconnect();
    }
}

testInventory();