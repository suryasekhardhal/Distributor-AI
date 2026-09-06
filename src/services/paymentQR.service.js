import QRCode from "qrcode";

export async function generatePaymentQR(paymentLink) {
    if (!paymentLink) {
        throw new Error("paymentLink is required");
    }

    return await QRCode.toDataURL(paymentLink);
}