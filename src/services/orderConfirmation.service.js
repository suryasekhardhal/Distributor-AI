import { Customer } from "../models/customer.model.js";
import { buildOrderPreview } from "./orderPreview.service.js";
import { createOrder } from "./order.service.js";

export async function confirmOrder({ companyId, customerPhone, items, notes }) {
  if (!companyId) {
    throw new Error("companyId is required");
  }

  if (!customerPhone) {
    throw new Error("customerPhone is required");
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Order must contain at least one item");
  }

  const customer = await Customer.findOne({
    companyId,
    phone: customerPhone,
    isActive: true,
  });

  if (!customer) {
    return {
      status: "customer_not_found",
      message: "Customer was not found.",
    };
  }

  const preview = await buildOrderPreview({
    companyId,
    customerPhone,
    items,
  });

  if (preview.status !== "ready") {
    return preview;
  }

  const result = await createOrder({
    companyId,
    customerId: customer._id,

    items: preview.items,

    subtotal: preview.subtotal,

    discount: preview.discount,

    totalAmount: preview.totalAmount,

    notes,
  });

  return {
    status: "confirmed",

    customer: {
      id: customer._id,
      name: customer.name,
      phone: customer.phone,
    },

    order: result.order,

    invoice: result.invoice,
  };
}
