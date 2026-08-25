import { Product } from "../models/product.model.js";

function normalizeProductName(name) {
    return name
        .trim()
        .toLowerCase()
        .replace(/[-_]/g, " ")
        .replace(/\s+/g, " ");
}

export async function matchProduct({
    companyId,
    productName,
}) {
    if (!companyId) {
        throw new Error("companyId is required");
    }

    if (!productName) {
        throw new Error("Product name is required");
    }

    const normalizedName = normalizeProductName(productName);

    const products = await Product.find({
        companyId,
        isActive: true,
    });

    const exactMatches = products.filter(
        (product) =>
            normalizeProductName(product.name) ===
            normalizedName
    );

    if (exactMatches.length === 1) {
        return {
            status: "matched",
            product: exactMatches[0],
        };
    }

    if (exactMatches.length > 1) {
        return {
            status: "ambiguous",
            products: exactMatches,
        };
    }

    const partialMatches = products.filter((product) => {
        const name = normalizeProductName(product.name);

        return (
            name.includes(normalizedName) ||
            normalizedName.includes(name)
        );
    });

    if (partialMatches.length === 1) {
        return {
            status: "matched",
            product: partialMatches[0],
        };
    }

    if (partialMatches.length > 1) {
        return {
            status: "ambiguous",
            products: partialMatches,
        };
    }

    return {
        status: "not_found",
        products: [],
    };
}