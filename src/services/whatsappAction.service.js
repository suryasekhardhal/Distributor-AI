// import {
//     getPendingConfirmation,
//     clearConversation,
// } from "./conversation.service.js";

// import {
//     executeAICommand,
// } from "./aiCommandExecutor.service.js";

// export async function handleWhatsAppAction({
//     companyId,
//     customerPhone,
//     actionId,
// }) {
//     if (!companyId) {
//         throw new Error(
//             "companyId is required"
//         );
//     }

//     if (!customerPhone) {
//         throw new Error(
//             "customerPhone is required"
//         );
//     }

//     if (!actionId) {
//         throw new Error(
//             "actionId is required"
//         );
//     }

//     const [action, confirmationId] =
//         actionId.split(":");

//     if (
//         !action ||
//         !confirmationId
//     ) {
//         return {
//             status: "invalid_action",
//             message:
//                 "Invalid WhatsApp action.",
//         };
//     }

//     const conversation =
//         await getPendingConfirmation({
//             companyId,
//             customerPhone,
//             confirmationId,
//         });

//     if (!conversation) {
//         return {
//             status:
//                 "confirmation_expired",

//             message:
//                 "This order confirmation has expired or is no longer valid.",
//         };
//     }

//     // -----------------------------------------
//     // CANCEL
//     // -----------------------------------------

//     if (
//         action ===
//         "cancel_order"
//     ) {
//         await clearConversation({
//             companyId,
//             customerPhone,
//         });

//         return {
//             status: "cancelled",

//             message:
//                 "Order cancelled.",
//         };
//     }

//     // -----------------------------------------
//     // CONFIRM
//     // -----------------------------------------

//     if (
//         action ===
//         "confirm_order"
//     ) {
//         const command = {
//             ...conversation.pendingCommand,

//             intent:
//                 "confirm_order",

//             customerPhone,
//         };

//         const result =
//             await executeAICommand({
//                 companyId,
//                 command,
//             });

//         await clearConversation({
//             companyId,
//             customerPhone,
//         });

//         return result;
//     }

//     return {
//         status: "invalid_action",

//         message:
//             "Unsupported WhatsApp action.",
//     };
// }

import {
  getPendingConfirmation,
  clearConversation,
} from "./conversation.service.js";

import { executeAICommand } from "./aiCommandExecutor.service.js";

import { Conversation } from "../models/conversation.model.js";

import { Order } from "../models/order.model.js";

export async function handleWhatsAppAction({
  companyId,
  customerPhone,
  actionId,
}) {
  if (!companyId) {
    throw new Error("companyId is required");
  }

  if (!customerPhone) {
    throw new Error("customerPhone is required");
  }

  if (!actionId) {
    throw new Error("actionId is required");
  }

  // -----------------------------------------
  // PAYMENT ACTION
  // -----------------------------------------

  if (actionId.startsWith("payment:")) {
    const paymentMethod = actionId.split(":")[1];

    if (!["cod", "upi", "online"].includes(paymentMethod)) {
      return {
        status: "invalid_payment_method",
        message: "Invalid payment method.",
      };
    }

    const conversation = await Conversation.findOne({
      companyId,
      customerPhone,
      state: "awaiting_payment",
    });

    if (!conversation) {
      return {
        status: "payment_session_expired",
        message:
          "Your payment session has expired. Please place the order again.",
      };
    }

    if (!conversation.pendingOrderId) {
      return {
        status: "order_not_found",
        message: "I couldn't find the order associated with this payment.",
      };
    }

    const order = await Order.findOne({
      _id: conversation.pendingOrderId,
      companyId,
    });

    if (!order) {
      return {
        status: "order_not_found",
        message: "Order not found.",
      };
    }

    order.paymentMethod = paymentMethod;
    order.status = "confirmed";

    if (paymentMethod === "cod") {
      order.paymentStatus = "pending";
    }

    if (paymentMethod === "upi" || paymentMethod === "online") {
      order.paymentStatus = "pending";
    }

    await order.save();

    await order.save();

    conversation.paymentMethod = paymentMethod;
    conversation.state = "idle";
    conversation.expiresAt = null;

    await conversation.save();

    const paymentLabels = {
      cod: "Cash on Delivery",
      upi: "UPI",
      online: "Online Payment",
    };

    return {
      status: "payment_selected",
      message:
        `💳 Payment method: ${paymentLabels[paymentMethod]}\n\n` +
        `✅ Order ${order.orderNumber} is ready for processing.`,
      order,
    };
  }

  // -----------------------------------------
  // PARSE ACTION
  // -----------------------------------------

  const [action, confirmationId] = actionId.split(":");

  if (!action || !confirmationId) {
    return {
      status: "invalid_action",

      message: "Invalid WhatsApp action.",
    };
  }

  // -----------------------------------------
  // GET PENDING CONFIRMATION
  // -----------------------------------------

  const conversation = await getPendingConfirmation({
    companyId,
    customerPhone,
    confirmationId,
  });

  if (!conversation) {
    return {
      status: "confirmation_expired",

      message: "This order confirmation has expired or is no longer valid.",
    };
  }

  // -----------------------------------------
  // CANCEL
  // -----------------------------------------

  if (action === "cancel_order") {
    await clearConversation({
      companyId,
      customerPhone,
    });

    return {
      status: "cancelled",

      message: "Order cancelled.",
    };
  }

  // -----------------------------------------
  // CONFIRM ORDER
  // -----------------------------------------

  if (action === "confirm_order") {
    const command = {
      ...conversation.pendingCommand,

      intent: "confirm_order",

      customerPhone,
    };

    // -------------------------------------
    // CREATE ORDER + INVOICE
    // -------------------------------------

    const result = await executeAICommand({
      companyId,
      command,
    });

    // -------------------------------------
    // CHECK RESULT
    // -------------------------------------

    if (result?.status !== "confirmed") {
      return result;
    }

    // -------------------------------------
    // SAVE ORDER STATE
    // -------------------------------------

    const orderId = result?.order?._id;

    const invoiceId = result?.invoice?._id;

    if (!orderId) {
      throw new Error("Order ID missing after confirmation");
    }

    // -------------------------------------
    // MOVE TO ADDRESS STEP
    // -------------------------------------

    await Conversation.findOneAndUpdate(
      {
        companyId,
        customerPhone,
      },

      {
        $set: {
          state: "awaiting_address",

          pendingOrderId: orderId,

          pendingInvoiceId: invoiceId || null,

          deliveryAddress: null,

          paymentMethod: null,

          confirmationId: null,

          pendingCommand: null,

          pendingPreview: null,

          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      },

      {
        new: true,
      },
    );

    // -------------------------------------
    // RETURN ADDRESS REQUEST
    // -------------------------------------

    return {
      status: "awaiting_address",

      message:
        `✅ Order ${result.order.orderNumber} confirmed!\n\n` +
        `Total: ₹${result.order.totalAmount}\n\n` +
        `📍 Please send your delivery address.`,

      customer: result.customer,

      order: result.order,

      invoice: result.invoice,
    };
  }

  // -----------------------------------------
  // INVALID ACTION
  // -----------------------------------------

  return {
    status: "invalid_action",

    message: "Unsupported WhatsApp action.",
  };
}
