import { createPaymentLink } from "./paymentGateway.service.js";

export async function createWhatsAppPayment({
    order,
    invoice,
    customerPhone,
}) {
    if (!order?._id) {
        throw new Error("Order is required");
    }

    if (!invoice?._id) {
        throw new Error("Invoice is required");
    }

    if (!customerPhone) {
        throw new Error("Customer phone is required");
    }

    if (invoice.amountDue <= 0) {
        throw new Error("Invoice is already paid");
    }

    const payment = await createPaymentLink({
        amount: invoice.amountDue,
        invoiceId: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        customerPhone,
    });

    return {
        paymentLinkId: payment.id,
        paymentLink: payment.shortUrl,
        amount: payment.amount,
        currency: payment.currency,
        invoiceId: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        orderId: order._id,
        orderNumber: order.orderNumber,
        customerPhone,
    };
}