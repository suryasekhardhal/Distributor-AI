import { Product } from "../models/product.model.js";

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export async function findProduct({ companyId, productName, sku }) {
  if (!companyId) {
    throw new Error("companyId is required");
  }

  if (!productName && !sku) {
    return {
      status: "not_found",
    };
  }

  if (sku) {
    const productBySku = await Product.findOne({
      companyId,
      sku,
      isActive: true,
    });

    if (productBySku) {
      return {
        status: "found",
        product: productBySku,
      };
    }
  }

  if (productName) {
    const exact = await Product.findOne({
      companyId,
      name: productName,
      isActive: true,
    });

    if (exact) {
      return {
        status: "found",
        product: exact,
      };
    }
  }

  const products = await Product.find({
    companyId,
    isActive: true,
  }).lean();

  const normalizedSearch = normalize(productName);

  const normalizedMatch = products.find(
    (product) => normalize(product.name) === normalizedSearch,
  );

  if (normalizedMatch) {
    return {
      status: "found",
      product: normalizedMatch,
    };
  }

  const partialMatches = products.filter((product) => {
    const normalizedName = normalize(product.name);

    return (
      normalizedName.includes(normalizedSearch) ||
      normalizedSearch.includes(normalizedName)
    );
  });

  if (partialMatches.length === 1) {
    return {
      status: "found",
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
  };
}
