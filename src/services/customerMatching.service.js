import { Customer } from "../models/customer.model.js";

export async function findCustomerByPhone({
    companyId,
    phone,
}) {
    if (!companyId) {
        throw new Error("companyId is required");
    }

    if (!phone) {
        throw new Error("Customer phone is required");
    }

    const customer = await Customer.findOne({
        companyId,
        phone,
        isActive: true,
    });

    if (!customer) {
        return null;
    }

    return customer;
}