import { Inventory } from "../models/inventory.model.js";

export async function getInventory({
    companyId,
    productId,
}) {
    if (!companyId) {
        throw new Error("companyId is required");
    }

    if (!productId) {
        throw new Error("productId is required");
    }

    const inventory = await Inventory.findOne({
        companyId,
        productId,
    });

    if (!inventory) {
        return null;
    }

    const availableStock =
        inventory.quantity -
        inventory.reservedQuantity;

    return {
        inventory,
        availableStock,
    };
}

export async function validateInventory({
    companyId,
    productId,
    requestedQuantity,
}) {
    if (!Number.isFinite(requestedQuantity)) {
        throw new Error(
            "requestedQuantity must be a valid number"
        );
    }

    if (requestedQuantity <= 0) {
        throw new Error(
            "requestedQuantity must be greater than zero"
        );
    }

    const result = await getInventory({
        companyId,
        productId,
    });

    if (!result) {
        return {
            status: "not_found",
            availableStock: 0,
            requestedQuantity,
        };
    }

    const {
        availableStock,
    } = result;

    if (availableStock < requestedQuantity) {
        return {
            status: "insufficient",
            availableStock,
            requestedQuantity,
        };
    }

    return {
        status: "available",
        availableStock,
        requestedQuantity,
    };
}