import { Customer } from "../models/customer.model.js";

function normalize(value) {
    return String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
}

export async function findCustomer({
    companyId,
    customerPhone,
    customerName,
}) {
    if (!companyId) {
        throw new Error(
            "companyId is required"
        );
    }

    // -----------------------------------------
    // 1. PHONE IS AUTHORITATIVE
    // -----------------------------------------

    if (customerPhone) {
        const customer =
            await Customer.findOne({
                companyId,
                phone: customerPhone,
                isActive: true,
            });

        if (customer) {
            return customer;
        }
    }

    // -----------------------------------------
    // 2. NAME MATCH
    // -----------------------------------------

    if (!customerName) {
        return null;
    }

    const customers =
        await Customer.find({
            companyId,
            isActive: true,
        }).lean();

    const search =
        normalize(customerName);

    const matches =
        customers.filter(
            (customer) =>
                normalize(customer.name)
                    .includes(search) ||
                search.includes(
                    normalize(customer.name)
                )
        );

    if (matches.length === 1) {
        return matches[0];
    }

    return null;
}