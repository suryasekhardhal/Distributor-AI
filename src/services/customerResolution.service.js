import { Customer } from "../models/customer.model.js";
import { findCustomer } from "./customer.service.js";

export async function resolveOrCreateCustomer({
  companyId,
  customerPhone,
  customerName,
}) {
  if (!companyId) {
    throw new Error("companyId is required");
  }

  if (!customerPhone) {
    throw new Error("customerPhone is required");
  }

  const phone = String(customerPhone).replace(/\D/g, "");

  if (!phone) {
    throw new Error("Invalid customer phone");
  }

  const existingCustomer = await findCustomer({
    companyId,
    customerPhone: phone,
    customerName,
  });

  if (existingCustomer) {
    return {
      customer: existingCustomer,
      created: false,
    };
  }

  const name = customerName?.trim() || `WhatsApp Customer ${phone.slice(-4)}`;

  try {
    const customer = await Customer.create({
      companyId,
      name,
      phone,
      isActive: true,
    });

    console.log("\n========== NEW CUSTOMER CREATED ==========");

    console.dir(customer, {
      depth: null,
    });

    return {
      customer,
      created: true,
    };
  } catch (error) {
    if (error?.code === 11000) {
      const customer = await Customer.findOne({
        companyId,
        phone,
        isActive: true,
      });

      if (customer) {
        return {
          customer,
          created: false,
        };
      }
    }

    throw error;
  }
}
