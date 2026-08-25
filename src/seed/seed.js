import dotenv from "dotenv";
import mongoose from "mongoose";

import { Company } from "../models/company.model.js";
import { Customer } from "../models/customer.model.js";
import { Product } from "../models/product.model.js";
import { Inventory } from "../models/inventory.model.js";
import {DB_NAME} from "../constants.js"

dotenv.config();

async function seed() {
    try {
        await mongoose.connect(`${process.env.MONGO_DB_URI}/${DB_NAME}`);

        console.log("MongoDB connected");

        // --------------------------------------------------
        // CLEAR EXISTING SEED DATA
        // --------------------------------------------------

        await Inventory.deleteMany({});
        await Product.deleteMany({});
        await Customer.deleteMany({});
        await Company.deleteMany({});

        // --------------------------------------------------
        // COMPANY
        // --------------------------------------------------

        const company = await Company.create({
            name: "Demo Distributor",
            phone: "9876543210",
            email: "demo@distributor.com",
        });

        console.log("Company created");

        // --------------------------------------------------
        // CUSTOMERS
        // --------------------------------------------------

        const customers = await Customer.insertMany([
            {
                companyId: company._id,
                name: "Ramesh",
                phone: "919876543210",
                email: "ramesh@example.com",
            },
            {
                companyId: company._id,
                name: "Suresh",
                phone: "919876543211",
                email: "suresh@example.com",
            },
            {
                companyId: company._id,
                name: "Amit",
                phone: "919876543212",
                email: "amit@example.com",
            },
        ]);

        console.log(`${customers.length} customers created`);

        // --------------------------------------------------
        // PRODUCTS
        // --------------------------------------------------

        const products = await Product.insertMany([
            {
                companyId: company._id,
                name: "Parle-G",
                sku: "PARLE-G-001",
                description: "Parle-G glucose biscuits",
                category: "Biscuits",
                unit: "carton",
                sellingPrice: 480,
                costPrice: 430,
            },
            {
                companyId: company._id,
                name: "Tiger Glucose Biscuits",
                sku: "TIGER-001",
                description: "Tiger glucose biscuits",
                category: "Biscuits",
                unit: "carton",
                sellingPrice: 450,
                costPrice: 400,
            },
            {
                companyId: company._id,
                name: "Britannia Marie Gold",
                sku: "MARIE-001",
                description: "Marie Gold biscuits",
                category: "Biscuits",
                unit: "carton",
                sellingPrice: 520,
                costPrice: 470,
            },
            {
                companyId: company._id,
                name: "Coca Cola 250ml",
                sku: "COKE-250-001",
                description: "Coca Cola 250ml bottles",
                category: "Beverages",
                unit: "case",
                sellingPrice: 720,
                costPrice: 650,
            },
            {
                companyId: company._id,
                name: "Pepsi 250ml",
                sku: "PEPSI-250-001",
                description: "Pepsi 250ml bottles",
                category: "Beverages",
                unit: "case",
                sellingPrice: 700,
                costPrice: 630,
            },
        ]);

        console.log(`${products.length} products created`);

        // --------------------------------------------------
        // INVENTORY
        // --------------------------------------------------

        const inventory = await Inventory.insertMany([
            {
                companyId: company._id,
                productId: products[0]._id,
                quantity: 100,
                reservedQuantity: 10,
            },
            {
                companyId: company._id,
                productId: products[1]._id,
                quantity: 80,
                reservedQuantity: 5,
            },
            {
                companyId: company._id,
                productId: products[2]._id,
                quantity: 60,
                reservedQuantity: 0,
            },
            {
                companyId: company._id,
                productId: products[3]._id,
                quantity: 50,
                reservedQuantity: 5,
            },
            {
                companyId: company._id,
                productId: products[4]._id,
                quantity: 40,
                reservedQuantity: 0,
            },
        ]);

        console.log(`${inventory.length} inventory records created`);

        console.log("\nSeed completed successfully");

        console.log("\nCompany ID:");
        console.log(company._id.toString());

        console.log("\nCustomers:");

        customers.forEach((customer) => {
            console.log(
                `${customer.name} -> ${customer.phone}`
            );
        });

        console.log("\nProducts:");

        products.forEach((product) => {
            console.log(
                `${product.name} -> ${product.sku} -> ₹${product.sellingPrice}/${product.unit}`
            );
        });

    } catch (error) {
        console.error("Seed failed:", error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
        console.log("\nMongoDB disconnected");
    }
}

seed();