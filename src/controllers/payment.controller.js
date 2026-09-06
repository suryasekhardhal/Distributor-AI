import { Invoice } from "../models/invoice.model.js";
import { createPaymentOrder,verifyPaymentSignature } from "../services/paymentGateway.service.js";
import { Payment } from "../models/payment.model.js";
import { recordPayment } from "../services/payment.service.js";
import { createPaymentRequest } from "../services/paymentRequest.service.js";

export async function createPayment(req, res) {
    try {
        const { invoiceId } = req.body;
        

        if (!invoiceId) {
            return res.status(400).json({
                success: false,
                message: "invoiceId is required",
            });
        }
const companyId = process.env.WHATSAPP_COMPANY_ID;





        const invoice = await Invoice.findOne({
            _id: invoiceId,
            companyId,
        });

        

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found",
            });
        }

        if (invoice.amountDue <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invoice is already paid",
            });
        }

        const paymentOrder = await createPaymentOrder({
            amount: invoice.amountDue,
            receipt: invoice.invoiceNumber,
        });

        return res.status(200).json({
            success: true,
            payment: {
                razorpayOrderId: paymentOrder.id,
                amount: paymentOrder.amount,
                currency: paymentOrder.currency,
                invoiceId: invoice._id,
                invoiceNumber: invoice.invoiceNumber,
                orderId: invoice.orderId,
            },
        });
    } catch (error) {
        console.error("Create payment error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create payment",
        });
    }
}

export async function verifyPayment(req, res) {
    try {
        const {
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            invoiceId,
            orderId,
        } = req.body;

        if (
            !razorpayOrderId ||
            !razorpayPaymentId ||
            !razorpaySignature ||
            !invoiceId ||
            !orderId
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment data is incomplete",
            });
        }

        const isValid = verifyPaymentSignature({
            orderId: razorpayOrderId,
            paymentId: razorpayPaymentId,
            signature: razorpaySignature,
        });

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature",
            });
        }

        const invoice = await Invoice.findById(invoiceId);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found",
            });
        }

        if (invoice.amountDue <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invoice is already paid",
            });
        }

        const companyId = invoice.companyId;

        const result = await recordPayment({
            companyId,
            invoiceId,
            orderId,
            amount: invoice.amountDue,
            gateway: "razorpay",
            gatewayPaymentId: razorpayPaymentId,
            status: "successful",
        });

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            data: result,
        });

    } catch (error) {
        console.error("Verify payment error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

export async function createPaymentRequestController(req, res) {
    try {
        const { invoiceId } = req.body;

        if (!invoiceId) {
            return res.status(400).json({
                success: false,
                message: "invoiceId is required",
            });
        }

        const companyId =
            process.env.WHATSAPP_COMPANY_ID;

        const invoice = await Invoice.findOne({
            _id: invoiceId,
            companyId,
        }).populate("customerId");

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found",
            });
        }

        if (invoice.amountDue <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invoice is already paid",
            });
        }

        const customerPhone =
            invoice.customerId?.phone;

        if (!customerPhone) {
            return res.status(400).json({
                success: false,
                message: "Customer phone number not found",
            });
        }

        const payment = await createPaymentRequest({
            amount: invoice.amountDue,
            invoiceId: invoice._id,
            invoiceNumber: invoice.invoiceNumber,
            customerPhone,
        });

        return res.status(200).json({
            success: true,
            payment,
        });
    } catch (error) {
        console.error(
            "Create payment request error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}