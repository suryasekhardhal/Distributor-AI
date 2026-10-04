import crypto from "crypto";
import { Invoice } from "../models/invoice.model.js";
import { Order } from "../models/order.model.js";
import { Customer } from "../models/customer.model.js";
import { recordPayment } from "../services/payment.service.js";
import { generateInvoicePDF } from "../services/invoicePdf.service.js";
import { sendWhatsAppInvoice } from "../services/whatsappApi.service.js";

export async function razorpayWebhook(req, res) {
  try {
    console.log("\n🔥 RAZORPAY WEBHOOK HIT 🔥");

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("❌ RAZORPAY_WEBHOOK_SECRET is missing");
      return res.status(500).json({
        success: false,
        message: "Webhook secret is not configured",
      });
    }

    // IMPORTANT:
    // req.body must be the RAW Buffer.
    const rawBody = req.body;

    const signature = req.headers["x-razorpay-signature"];

    if (!signature) {
      console.error("❌ Razorpay signature missing");

      return res.status(400).json({
        success: false,
        message: "Webhook signature missing",
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("❌ Invalid Razorpay webhook signature");

      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    console.log("✅ Razorpay webhook signature verified");

    const event = JSON.parse(rawBody.toString());

    console.log("Razorpay event:", event.event);

    // We only care about successful Payment Link payments
    if (event.event !== "payment_link.paid") {
      console.log(`ℹ️ Ignoring event: ${event.event}`);

      return res.status(200).json({
        success: true,
        message: "Event ignored",
      });
    }

    const paymentLink = event.payload?.payment_link?.entity;

    const payment = event.payload?.payment?.entity;

    if (!paymentLink || !payment) {
      console.error("❌ Payment Link or payment data missing");

      return res.status(400).json({
        success: false,
        message: "Invalid Razorpay webhook payload",
      });
    }

    console.log("Payment Link:", paymentLink.id);
    console.log("Payment:", payment.id);

    // We stored invoiceId as reference_id
    // when creating the Payment Link.
    const invoiceId = paymentLink.reference_id;

    if (!invoiceId) {
      console.error("❌ Invoice ID missing from payment link");

      return res.status(400).json({
        success: false,
        message: "Invoice ID missing",
      });
    }

    console.log("Invoice ID:", invoiceId);

    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      console.error("❌ Invoice not found:", invoiceId);

      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    console.log("Invoice found:", invoice.invoiceNumber);

    // Razorpay amount is in paise.
    // Your invoice amounts are stored in rupees.
    const amount = payment.amount / 100;

    console.log("Payment amount:", amount);

    //     const result = await recordPayment({
    //   companyId: invoice.companyId,
    //   invoiceId: invoice._id,
    //   orderId: invoice.orderId,
    //   amount,
    //   gateway: "razorpay",
    //   gatewayPaymentId: payment.id,
    //   status: "successful",
    // });

    // console.log("✅ Payment recorded successfully");

    const result = await recordPayment({
      companyId: invoice.companyId,
      invoiceId: invoice._id,
      orderId: invoice.orderId,
      amount,
      gateway: "razorpay",
      gatewayPaymentId: payment.id,
      status: "successful",
    });

    if (result?.duplicate) {
      console.log("ℹ️ Duplicate Razorpay webhook ignored");

      return res.status(200).json({
        success: true,
        message: "Duplicate payment webhook ignored",
      });
    }

    console.log("✅ Payment recorded successfully");

    // THEN generate PDF and send WhatsApp invoice

    console.log({
      paymentId: payment.id,
      invoiceId: invoice._id,
      orderId: invoice.orderId,
      amount,
    });

    // ==========================================
    // SEND INVOICE AFTER FULL PAYMENT
    // ==========================================

    if (result?.invoice?.status === "paid") {
      console.log("💰 Invoice is fully paid");

      const order = await Order.findOne({
        _id: invoice.orderId,
        companyId: invoice.companyId,
      });

      if (!order) {
        throw new Error("Order not found after payment");
      }

      // Customer phone was stored inside
      // Razorpay Payment Link notes.
      const customerPhone = paymentLink.notes?.customerPhone;

      if (!customerPhone) {
        throw new Error(
          "Customer WhatsApp phone not found in payment link notes",
        );
      }

      console.log("📱 Customer WhatsApp:", customerPhone);

      // Try to load customer details.
      let customer = null;

      if (order.customerId) {
        customer = await Customer.findOne({
          _id: order.customerId,
          companyId: invoice.companyId,
        }).lean();
      }

      // Generate invoice PDF
      console.log("📄 Generating invoice PDF...");

      const pdfBuffer = await generateInvoicePDF({
        invoice: result.invoice,
        order,
        customer,
      });

      console.log("✅ Invoice PDF generated:", pdfBuffer.length, "bytes");

      // Send invoice through WhatsApp
      console.log("📤 Sending invoice to WhatsApp...");

      await sendWhatsAppInvoice({
        to: customerPhone,
        pdfBuffer,
        invoiceNumber: result.invoice.invoiceNumber,
      });

      console.log("✅ Invoice sent successfully to WhatsApp");
    }

    return res.status(200).json({
      success: true,
      message: "Payment processed successfully",
      data: result,
    });
  } catch (error) {
    console.error("❌ Razorpay webhook error:", error);

    return res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
}
