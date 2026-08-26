import { validateAICommand } from "./aiCommand.service.js";

import { confirmOrder } from "./orderConfirmation.service.js";

import { recordPayment } from "./payment.service.js";

import { buildOrderPreview } from "./orderPreview.service.js";

export async function executeAICommand({ companyId, command }) {
  const validation = validateAICommand(command);

  if (!validation.valid) {
    return {
      status: "invalid_command",
      message: validation.message,
    };
  }

  switch (command.intent) {
    case "confirm_order":
      return await confirmOrder({
        companyId,

        customerPhone: command.customerPhone,

        items: command.items,

        notes: command.notes,
      });

    case "record_payment":
      return await recordPayment({
        companyId,

        invoiceId: command.invoiceId,

        orderId: command.orderId,

        amount: command.amount,

        gateway: command.gateway,

        gatewayPaymentId: command.gatewayPaymentId,

        status: command.status || "successful",
      });

    case "create_order": {
      const preview = await buildOrderPreview({
        companyId,

        customerPhone: command.customerPhone,

        items: command.items,
      });

      if (preview.status !== "ready") {
        return preview;
      }

      return {
        status: "requires_confirmation",

        message: "Order preview created. Customer confirmation is required.",

        customer: preview.customer,

        items: preview.items,

        subtotal: preview.subtotal,

        discount: preview.discount,

        totalAmount: preview.totalAmount,
      };
    }

    case "check_order":
      return {
        status: "not_implemented",
        message: "Order lookup will be implemented next.",
      };

    case "check_invoice":
      return {
        status: "not_implemented",
        message: "Invoice lookup will be implemented next.",
      };

    default:
      throw new Error(`Unsupported intent: ${command.intent}`);
  }
}
