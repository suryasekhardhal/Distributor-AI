import dotenv from "dotenv";
import mongoose from "mongoose";

import { Company } from "../models/company.model.js";
import { Customer } from "../models/customer.model.js";
import { Invoice } from "../models/invoice.model.js";
import { Order } from "../models/order.model.js";
import {DB_NAME} from "../constants.js"

import {
    buildOrderPreview,
} from "../services/orderPreview.service.js";

import {
    createOrder,
} from "../services/order.service.js";

import {
    recordPayment,
} from "../services/payment.service.js";

dotenv.config();

async function testPayment() {
    try {
        await mongoose.connect(
            `${process.env.MONGO_DB_URI}/${DB_NAME}`
        );

        const company =
            await Company.findOne({
                name: "Demo Distributor",
            });

        const customer =
            await Customer.findOne({
                companyId:
                    company._id,
                phone:
                    "919876543210",
            });

        // -----------------------------------------
        // CREATE ORDER
        // -----------------------------------------

        const preview =
            await buildOrderPreview({
                companyId:
                    company._id,

                customerPhone:
                    customer.phone,

                items: [
                    {
                        productName:
                            "Parle G",

                        quantity: 20,

                        unit: "carton",
                    },
                ],
            });

        if (preview.status !== "ready") {
            throw new Error(
                "Preview was not ready"
            );
        }

        const result =
            await createOrder({
                companyId:
                    company._id,

                customerId:
                    customer._id,

                items:
                    preview.items,

                subtotal:
                    preview.subtotal,

                discount:
                    preview.discount,

                totalAmount:
                    preview.totalAmount,
            });

        const {
            order,
            invoice,
        } = result;

        console.log(
            "\nORDER CREATED:"
        );

        console.dir(
            order,
            { depth: null }
        );

        console.log(
            "\nINVOICE CREATED:"
        );

        console.dir(
            invoice,
            { depth: null }
        );

        // -----------------------------------------
        // PAYMENT 1 — PARTIAL
        // -----------------------------------------

        const partialPayment =
            await recordPayment({
                companyId:
                    company._id,

                invoiceId:
                    invoice._id,

                orderId:
                    order._id,

                amount: 5000,

                gateway:
                    "test_gateway",

                gatewayPaymentId:
                    `test_${Date.now()}_1`,

                status:
                    "successful",
            });

        console.log(
            "\nAFTER ₹5,000 PAYMENT:"
        );

        console.log(
            "Invoice:"
        );

        console.dir(
            partialPayment.invoice,
            { depth: null }
        );

        console.log(
            "Order:"
        );

        console.dir(
            partialPayment.order,
            { depth: null }
        );

        // -----------------------------------------
        // PAYMENT 2 — REMAINING
        // -----------------------------------------

        const finalPayment =
            await recordPayment({
                companyId:
                    company._id,

                invoiceId:
                    invoice._id,

                orderId:
                    order._id,

                amount: 4600,

                gateway:
                    "test_gateway",

                gatewayPaymentId:
                    `test_${Date.now()}_2`,

                status:
                    "successful",
            });

        console.log(
            "\nAFTER ₹4,600 PAYMENT:"
        );

        console.log(
            "Invoice:"
        );

        console.dir(
            finalPayment.invoice,
            { depth: null }
        );

        console.log(
            "Order:"
        );

        console.dir(
            finalPayment.order,
            { depth: null }
        );

    } catch (error) {
        console.error(
            "\nPayment test failed:",
            error
        );
    } finally {
        await mongoose.disconnect();
    }
}

testPayment();