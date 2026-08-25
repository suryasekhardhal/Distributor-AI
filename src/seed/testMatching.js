import dotenv from "dotenv";
import mongoose from "mongoose";

import { Company } from "../models/company.model.js";
import { Customer } from "../models/customer.model.js";

import { findCustomerByPhone } from "../services/customerMatching.service.js";
import { matchProduct } from "../services/productMatching.service.js";
import {DB_NAME} from "../constants.js"

dotenv.config();

async function testMatching() {
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

        // -----------------------------
        // CUSTOMER TEST
        // -----------------------------

        const customer = await findCustomerByPhone({
            companyId: company._id,
            phone: "919876543210",
        });

        console.log("\nCUSTOMER MATCH:");
        console.log(customer);

        // -----------------------------
        // PRODUCT TEST
        // -----------------------------

        const product = await matchProduct({
            companyId: company._id,
            productName: "Parle-G",
        });

        console.log("\nPRODUCT MATCH:");
        console.log(product);

        // -----------------------------
        // PRODUCT PARTIAL MATCH TEST
        // -----------------------------

        const partialProduct = await matchProduct({
            companyId: company._id,
            productName: "Parle G",
        });

        console.log("\nPARTIAL PRODUCT MATCH:");
        console.log(partialProduct);

        // -----------------------------
        // PRODUCT NOT FOUND TEST
        // -----------------------------

        const missingProduct = await matchProduct({
            companyId: company._id,
            productName: "Lays",
        });

        console.log("\nMISSING PRODUCT:");
        console.log(missingProduct);

    } catch (error) {
        console.error(
            "Matching test failed:",
            error
        );
    } finally {
        await mongoose.disconnect();
    }
}

testMatching();