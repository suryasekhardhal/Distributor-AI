import mongoose from "mongoose";

import { Payment } from "../models/payment.model.js";
import { PaymentAllocation } from "../models/paymentAllocation.model.js";
import { Invoice } from "../models/invoice.model.js";
import { Order } from "../models/order.model.js";

export async function recordPayment({
    companyId,
    invoiceId,
    orderId,
    amount,
    gateway,
    gatewayPaymentId,
    status = "successful",
}) {
    if (!companyId) {
        throw new Error("companyId is required");
    }

    if (!invoiceId) {
        throw new Error("invoiceId is required");
    }

    if (!orderId) {
        throw new Error("orderId is required");
    }

    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error(
            "Payment amount must be greater than zero"
        );
    }

    if (!gateway) {
        throw new Error("gateway is required");
    }

    if (!gatewayPaymentId) {
        throw new Error(
            "gatewayPaymentId is required"
        );
    }

    const session =
        await mongoose.startSession();

    try {
        session.startTransaction();

        // -----------------------------------------
        // 1. FIND INVOICE
        // -----------------------------------------

        const invoice =
            await Invoice.findOne({
                _id: invoiceId,
                companyId,
                orderId,
            }).session(session);

        if (!invoice) {
            throw new Error(
                "Invoice not found"
            );
        }

        // -----------------------------------------
        // 2. PREVENT OVERPAYMENT
        // -----------------------------------------

        if (amount > invoice.amountDue) {
            throw new Error(
                `Payment exceeds invoice amount due. Amount due: ${invoice.amountDue}`
            );
        }

        // -----------------------------------------
        // 3. CREATE PAYMENT
        // -----------------------------------------

        const [payment] =
            await Payment.create(
                [
                    {
                        companyId,
                        invoiceId,
                        orderId,

                        amount,

                        gateway,
                        gatewayPaymentId,

                        status,

                        paidAt:
                            status ===
                            "successful"
                                ? new Date()
                                : undefined,
                    },
                ],
                { session }
            );

        // -----------------------------------------
        // 4. ONLY SUCCESSFUL PAYMENTS
        //    AFFECT INVOICE
        // -----------------------------------------

        if (status === "successful") {
            const newAmountPaid =
                invoice.amountPaid +
                amount;

            const newAmountDue =
                invoice.totalAmount -
                newAmountPaid;

            let invoiceStatus =
                "partial";

            if (newAmountDue === 0) {
                invoiceStatus = "paid";
            }

            // -------------------------------------
            // UPDATE INVOICE
            // -------------------------------------

            invoice.amountPaid =
                newAmountPaid;

            invoice.amountDue =
                newAmountDue;

            invoice.status =
                invoiceStatus;

            await invoice.save({
                session,
            });

            // -------------------------------------
            // CREATE PAYMENT ALLOCATION
            // -------------------------------------

            await PaymentAllocation.create(
                [
                    {
                        companyId,

                        paymentId:
                            payment._id,

                        invoiceId,

                        amount,
                    },
                ],
                { session }
            );

            // -------------------------------------
            // UPDATE ORDER
            // -------------------------------------

            const order =
                await Order.findOne({
                    _id: orderId,
                    companyId,
                }).session(session);

            if (!order) {
                throw new Error(
                    "Order not found"
                );
            }

            order.paidAmount =
                newAmountPaid;

            if (newAmountDue === 0) {
                order.paymentStatus =
                    "paid";
            } else {
                order.paymentStatus =
                    "partial";
            }

            await order.save({
                session,
            });
        }

        await session.commitTransaction();

        return {
            payment:
                await Payment.findById(
                    payment._id
                ).lean(),

            invoice:
                await Invoice.findById(
                    invoice._id
                ).lean(),

            order:
                await Order.findById(
                    orderId
                ).lean(),
        };

    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        throw error;

    } finally {
        await session.endSession();
    }
}