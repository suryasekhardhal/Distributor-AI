import { createPaymentLink } from "./paymentGateway.service.js";
import { generatePaymentQR } from "./paymentQR.service.js";

export async function createPaymentRequest({
    amount,
    invoiceId,
    invoiceNumber,
    customerPhone,
}) {
    const paymentLink = await createPaymentLink({
        amount,
        invoiceId,
        invoiceNumber,
        customerPhone,
    });

    const qrCode = await generatePaymentQR(
        paymentLink.shortUrl
    );

    return {
        paymentLinkId: paymentLink.id,
        paymentLink: paymentLink.shortUrl,
        qrCode,
        amount: paymentLink.amount,
        currency: paymentLink.currency,
        invoiceId,
        invoiceNumber,
        customerPhone,
    };
}