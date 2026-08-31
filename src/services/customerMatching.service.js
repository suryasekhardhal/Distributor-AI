import { Customer } from "../models/customer.model.js";

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export async function findCustomer({ companyId, customerPhone, customerName }) {
  if (!companyId) {
    throw new Error("companyId is required");
  }

  if (customerPhone) {
    const customer = await Customer.findOne({
      companyId,
      phone: customerPhone,
      isActive: true,
    });

    if (customer) {
      return customer;
    }
  }

  if (!customerName) {
    return null;
  }

  const customers = await Customer.find({
    companyId,
    isActive: true,
  }).lean();

  const search = normalize(customerName);

  const matches = customers.filter(
    (customer) =>
      normalize(customer.name).includes(search) ||
      search.includes(normalize(customer.name)),
  );

  if (matches.length === 1) {
    return matches[0];
  }

  return null;
}

export async function findOrCreateCustomer({
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

  const name =
    String(customerName || "").trim() || `WhatsApp Customer ${phone.slice(-4)}`;

  try {
    const customer = await Customer.create({
      companyId,
      name,
      phone,
      isActive: true,
    });

    console.log("\n========== NEW WHATSAPP CUSTOMER CREATED ==========");

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
