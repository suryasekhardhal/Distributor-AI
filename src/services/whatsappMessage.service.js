export function buildTextMessage({ text }) {
  return {
    type: "text",

    text: {
      body: text,
    },
  };
}

export function buildOrderConfirmationMessage({
  customerName,
  preview,
  confirmationId,
}) {
  const itemsText = preview.items
    .map(
      (item) =>
        `${item.quantity} ${item.unit} × ${item.productName} — ₹${item.totalPrice}`,
    )
    .join("\n");

  return {
    type: "interactive",

    interactive: {
      type: "button",

      body: {
        text: [
          "📦 Order Preview",
          "",
          `Customer: ${customerName}`,
          "",
          itemsText,
          "",
          `Subtotal: ₹${preview.subtotal}`,
          `Discount: ₹${preview.discount}`,
          `Total: ₹${preview.totalAmount}`,
          "",
          "Please confirm your order.",
        ].join("\n"),
      },

      action: {
        buttons: [
          {
            type: "reply",

            reply: {
              id: `confirm_order:${confirmationId}`,

              title: "✅ Confirm Order",
            },
          },

          {
            type: "reply",

            reply: {
              id: `cancel_order:${confirmationId}`,

              title: "❌ Cancel Order",
            },
          },
        ],
      },
    },
  };
}

export function buildPaymentMethodMessage() {
  return {
    type: "interactive",
    interactive: {
      type: "button",
      body: {
        text: "💳 Choose your payment method:",
      },
      action: {
        buttons: [
          {
            type: "reply",
            reply: {
              id: "payment:cod",
              title: "Cash on Delivery",
            },
          },
          {
            type: "reply",
            reply: {
              id: "payment:upi",
              title: "UPI",
            },
          },
          {
            type: "reply",
            reply: {
              id: "payment:online",
              title: "Online Payment",
            },
          },
        ],
      },
    },
  };
}
