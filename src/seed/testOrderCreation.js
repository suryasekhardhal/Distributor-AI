import dotenv from "dotenv";
import mongoose from "mongoose";

import { Company } from "../models/company.model.js";
import { Customer } from "../models/customer.model.js";
import { Product } from "../models/product.model.js";
import { Inventory } from "../models/inventory.model.js";
import { Order } from "../models/order.model.js";
import { OrderItem } from "../models/orderItem.model.js";
import { Invoice } from "../models/invoice.model.js";

import {
    buildOrderPreview,
} from "../services/orderPreview.service.js";

import {
    createOrder,
} from "../services/order.service.js";

import {DB_NAME} from "../constants.js"

dotenv.config();

async function testOrderCreation() {
    try {
        await mongoose.connect(`${process.env.MONGO_DB_URI}/${DB_NAME}`);

        const company =
            await Company.findOne({
                name: "Demo Distributor",
            });

        const customer =
            await Customer.findOne({
                companyId: company._id,
                phone: "919876543210",
            });

        // -----------------------------------------
        // BUILD PREVIEW
        // -----------------------------------------

        const preview =
            await buildOrderPreview({
                companyId: company._id,
                customerPhone:
                    customer.phone,

                items: [
                    {
                        productName: "Parle G",
                        quantity: 20,
                        unit: "carton",
                    },
                ],
            });

        console.log(
            "\nORDER PREVIEW:"
        );

        console.dir(
            preview,
            { depth: null }
        );

        if (preview.status !== "ready") {
            throw new Error(
                "Preview was not ready"
            );
        }

        // -----------------------------------------
        // CREATE ORDER
        // -----------------------------------------

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
            invoice,
            { depth: null }
        );

        // -----------------------------------------
        // CHECK ORDER ITEMS
        // -----------------------------------------

        const orderItems =
            await OrderItem.find({
                orderId: order._id,
            }).lean();

        console.log(
            "\nORDER ITEMS:"
        );

        console.dir(
            orderItems,
            { depth: null }
        );


        // -----------------------------------------
// CHECK INVOICE
// -----------------------------------------

const storedInvoice =
    await Invoice.findOne({
        orderId: order._id,
    }).lean();

console.log(
    "\nINVOICE:"
);

console.dir(
    storedInvoice,
    { depth: null }
);

console.log(
    "\nINVOICE CHECK:"
);

console.log(
    "Invoice exists:",
    !!storedInvoice
);

console.log(
    "Invoice amount:",
    storedInvoice?.totalAmount
);

console.log(
    "Amount paid:",
    storedInvoice?.amountPaid
);

console.log(
    "Amount due:",
    storedInvoice?.amountDue
);

console.log(
    "Invoice status:",
    storedInvoice?.status
);

        // -----------------------------------------
        // CHECK INVENTORY
        // -----------------------------------------

        const product =
            await Product.findOne({
                companyId:
                    company._id,
                sku: "PARLE-G-001",
            });

        const inventory =
            await Inventory.findOne({
                companyId:
                    company._id,
                productId:
                    product._id,
            }).lean();

        console.log(
            "\nINVENTORY AFTER ORDER:"
        );

        console.dir(
            inventory,
            { depth: null }
        );

        // -----------------------------------------
        // FINAL CHECKS
        // -----------------------------------------

        const orderCount =
            await Order.countDocuments({
                _id: order._id,
            });

        const orderItemCount =
            await OrderItem.countDocuments({
                orderId: order._id,
            });

        console.log(
            "\nRESULT:"
        );

        console.log(
            "Order exists:",
            orderCount === 1
        );

        console.log(
            "Order item exists:",
            orderItemCount === 1
        );

        console.log(
            "Reserved quantity:",
            inventory.reservedQuantity
        );

    } catch (error) {
        console.error(
            "\nOrder creation test failed:",
            error
        );
    } finally {
        await mongoose.disconnect();
    }
}

testOrderCreation();