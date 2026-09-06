import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function createPaymentOrder({
    amount,
    receipt,
}) {
    if (!amount || amount <= 0) {
        throw new Error("Amount must be greater than zero");
    }

    if (!receipt) {
        throw new Error("receipt is required");
    }

    const order = await razorpay.orders.create({
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt,
    });

    return {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
    };
}

export function verifyPaymentSignature({
    orderId,
    paymentId,
    signature,
}) {
    if (!orderId || !paymentId || !signature) {
        throw new Error(
            "Payment verification data is incomplete"
        );
    }

    const expectedSignature = crypto
        .createHmac(
            "sha256",
            process.env.RAZORPAY_KEY_SECRET
        )
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

    return expectedSignature === signature;
}

export async function createPaymentLink({
    amount,
    invoiceId,
    invoiceNumber,
    customerPhone,
}) {
    if (!amount || amount <= 0) {
        throw new Error("Amount must be greater than zero");
    }

    if (!invoiceId) {
        throw new Error("invoiceId is required");
    }

    const paymentLink = await razorpay.paymentLink.create({
        amount: Math.round(amount * 100),
        currency: "INR",

        description: `Payment for ${invoiceNumber}`,

        reference_id: String(invoiceId),

        customer: {
            contact: customerPhone,
        },

        notify: {
            sms: false,
            email: false,
        },

        reminder_enable: false,

        notes: {
            invoiceId: String(invoiceId),
            invoiceNumber,
            customerPhone,
        },
    });

    return {
        id: paymentLink.id,
        shortUrl: paymentLink.short_url,
        amount: paymentLink.amount,
        currency: paymentLink.currency,
        status: paymentLink.status,
    };
}