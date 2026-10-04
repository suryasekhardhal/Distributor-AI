import PDFDocument from "pdfkit";

export function generateInvoicePDF({ invoice, order, customer }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
      });

      const chunks = [];

      doc.on("data", (chunk) => {
        chunks.push(chunk);
      });

      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });

      doc.on("error", reject);

      // ==========================================
      // HEADER
      // ==========================================

      doc
        .fontSize(24)
        .font("Helvetica-Bold")
        .text("INVOICE", {
          align: "center",
        });

      doc.moveDown();

      doc
        .fontSize(11)
        .font("Helvetica")
        .text(`Invoice Number: ${invoice.invoiceNumber}`);

      doc.text(
        `Date: ${new Date(invoice.createdAt).toLocaleDateString("en-IN")}`
      );

      doc.text(`Order Number: ${order?.orderNumber || "N/A"}`);

      doc.moveDown();

      // ==========================================
      // CUSTOMER
      // ==========================================

      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("Bill To");

      doc.moveDown(0.5);

      doc
        .fontSize(11)
        .font("Helvetica")
        .text(`Name: ${customer?.name || "Customer"}`);

      if (customer?.phone) {
        doc.text(`Phone: ${customer.phone}`);
      }

      if (order?.deliveryAddress) {
        doc.text(`Address: ${order.deliveryAddress}`);
      }

      doc.moveDown();

      // ==========================================
      // PAYMENT
      // ==========================================

      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("Payment Details");

      doc.moveDown(0.5);

      doc
        .fontSize(11)
        .font("Helvetica")
        .text(`Payment Status: ${invoice.status}`);

      doc.text(
        `Amount Paid: ₹${Number(invoice.amountPaid || 0).toFixed(2)}`
      );

      doc.text(
        `Amount Due: ₹${Number(invoice.amountDue || 0).toFixed(2)}`
      );

      doc.moveDown();

      // ==========================================
      // TOTAL
      // ==========================================

      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .text(
          `Total Amount: ₹${Number(invoice.totalAmount || 0).toFixed(2)}`,
          {
            align: "right",
          }
        );

      doc.moveDown(2);

      doc
        .fontSize(10)
        .font("Helvetica")
        .text(
          "Thank you for your business.",
          {
            align: "center",
          }
        );

      doc.end();

    } catch (error) {
      reject(error);
    }
  });
}