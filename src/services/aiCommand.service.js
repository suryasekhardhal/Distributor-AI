const ALLOWED_INTENTS = [
  "create_order",
  "confirm_order",
  "record_payment",
  "check_order",
  "check_invoice",
];

export function validateAICommand(command) {
  if (!command || typeof command !== "object") {
    return {
      valid: false,
      message: "Invalid command.",
    };
  }

  if (!command.intent) {
    return {
      valid: false,
      message: "Command intent is required.",
    };
  }

  if (!ALLOWED_INTENTS.includes(command.intent)) {
    return {
      valid: false,
      message: `Unsupported intent: ${command.intent}`,
    };
  }

  let error = null;

  switch (command.intent) {
    case "create_order":
      error = validateCreateOrder(command);
      break;

    case "confirm_order":
      error = validateConfirmOrder(command);
      break;

    case "record_payment":
      error = validateRecordPayment(command);
      break;

    case "check_order":
    case "check_invoice":
      if (!command.customerPhone && !command.orderId && !command.invoiceId) {
        error = "A customerPhone, orderId, or invoiceId is required";
      }
      break;
  }

  if (error) {
    return {
      valid: false,
      message: error,
    };
  }

  return {
    valid: true,
    command,
  };
}

function validateCreateOrder(command) {
  if (!command.customerPhone) {
    return "customerPhone is required";
  }

  if (!Array.isArray(command.items) || command.items.length === 0) {
    return "At least one order item is required";
  }

  for (const item of command.items) {
    if (!item.productName) {
      return "productName is required";
    }

    if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
      return "quantity must be greater than zero";
    }

    if (!item.unit) {
      return "unit is required";
    }
  }

  return null;
}

function validateConfirmOrder(command) {
  if (!command.customerPhone) {
    return "customerPhone is required";
  }

  if (!Array.isArray(command.items) || command.items.length === 0) {
    return "At least one order item is required";
  }

  return null;
}

function validateRecordPayment(command) {
  if (!command.invoiceId) {
    return "invoiceId is required";
  }

  if (!Number.isFinite(command.amount) || command.amount <= 0) {
    return "payment amount must be greater than zero";
  }

  return null;
}
