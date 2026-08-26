import { Product } from "../models/product.model.js";

import {
    findCustomer as findCustomerByPhone,
} from "./customerMatching.service.js";

import {
  findProduct as  matchProduct,
} from "./productMatching.service.js";

import {
    validateInventory,
} from "./inventory.service.js";

export async function buildOrderPreview({
    companyId,
    customerPhone,
    items,
}) {
    if (!companyId) {
        throw new Error("companyId is required");
    }

    if (!customerPhone) {
        throw new Error(
            "customerPhone is required"
        );
    }

    if (!Array.isArray(items) || items.length === 0) {
        throw new Error(
            "Order must contain at least one item"
        );
    }

    // -----------------------------------------
    // CUSTOMER
    // -----------------------------------------

    const customer =
        await findCustomerByPhone({
            companyId,
            customerPhone,
        });

    if (!customer) {
        return {
            status: "customer_not_found",
            message:
                "Customer could not be identified.",
        };
    }

    const previewItems = [];

    // -----------------------------------------
    // PRODUCTS + INVENTORY
    // -----------------------------------------

    for (const item of items) {
        const productResult =
            await matchProduct({
                companyId,
                productName: item.productName,
                sku: item.sku,
            });

        if (
            productResult.status ===
            "not_found"
        ) {
            return {
                status: "product_not_found",
                message:
                    `Product "${item.productName}" was not found.`,
                customer,
            };
        }

        if (
            productResult.status ===
            "ambiguous"
        ) {
            return {
                status: "product_ambiguous",
                message:
                    `Multiple products matched "${item.productName}".`,
                customer,
                products:
                    productResult.products,
            };
        }

        const product =
            productResult.product;

        // -------------------------------------
        // UNIT VALIDATION
        // -------------------------------------

        if (
            item.unit &&
            item.unit.toLowerCase() !==
                product.unit.toLowerCase()
        ) {
            return {
                status: "unit_mismatch",
                message:
                    `The requested unit for "${product.name}" does not match the product unit.`,
                customer,
                product,
            };
        }

        // -------------------------------------
        // INVENTORY
        // -------------------------------------

        const inventoryResult =
            await validateInventory({
                companyId,
                productId: product._id,
                requestedQuantity:
                    item.quantity,
            });

        if (
            inventoryResult.status ===
            "not_found"
        ) {
            return {
                status: "inventory_not_found",
                message:
                    `Inventory not found for "${product.name}".`,
                customer,
                product,
            };
        }

        if (
            inventoryResult.status ===
            "insufficient"
        ) {
            return {
                status: "insufficient_inventory",
                message:
                    `Only ${inventoryResult.availableStock} ${product.unit} of "${product.name}" are available.`,
                customer,
                product,
                availableStock:
                    inventoryResult.availableStock,
                requestedQuantity:
                    item.quantity,
            };
        }

        // -------------------------------------
        // PRICE CALCULATION
        // -------------------------------------

        const totalPrice =
            product.sellingPrice *
            item.quantity;

        previewItems.push({
            productId: product._id,
            productName: product.name,
            sku: product.sku,
            quantity: item.quantity,
            unit: product.unit,
            unitPrice: product.sellingPrice,
            totalPrice,
        });
    }

    // -----------------------------------------
    // ORDER TOTAL
    // -----------------------------------------

    const subtotal = previewItems.reduce(
        (sum, item) =>
            sum + item.totalPrice,
        0
    );

    return {
        status: "ready",
        customer: {
            id: customer._id,
            name: customer.name,
            phone: customer.phone,
        },

        items: previewItems,

        subtotal,
        discount: 0,
        totalAmount: subtotal,
    };
}