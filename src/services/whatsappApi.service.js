const WHATSAPP_MODE = process.env.WHATSAPP_MODE || "meta";

const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || "v23.0";

const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

function getMessagesUrl() {
  if (!WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error("WHATSAPP_PHONE_NUMBER_ID is missing");
  }

  return `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
}

function getHeaders() {
  if (!WHATSAPP_ACCESS_TOKEN) {
    throw new Error("WHATSAPP_ACCESS_TOKEN is missing");
  }

  return {
    Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,

    "Content-Type": "application/json",
  };
}

export async function sendWhatsAppMessage({ to, message }) {
  if (!to) {
    throw new Error("WhatsApp recipient is required");
  }

  if (!message) {
    throw new Error("WhatsApp message is required");
  }

  if (WHATSAPP_MODE === "simulator") {
    console.log("\n========== SIMULATED WHATSAPP RESPONSE ==========");

    console.log("TO:", to);

    console.dir(message, { depth: null });

    console.log("=================================================\n");

    return {
      simulated: true,
      to,
      message,
    };
  }

  const response = await fetch(getMessagesUrl(), {
    method: "POST",

    headers: getHeaders(),

    body: JSON.stringify({
      messaging_product: "whatsapp",

      recipient_type: "individual",

      to,

      ...message,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("WhatsApp API error:", data);

    throw new Error(data?.error?.message || "Failed to send WhatsApp message");
  }

  return data;
}

export async function uploadWhatsAppDocument({ pdfBuffer }) {
  if (!pdfBuffer) {
    throw new Error("PDF buffer is required");
  }

  if (WHATSAPP_MODE === "simulator") {
    console.log("📄 WhatsApp document upload simulated");

    return {
      id: "simulated-media-id",
    };
  }

  const url =
    `https://graph.facebook.com/${WHATSAPP_API_VERSION}/` +
    `${WHATSAPP_PHONE_NUMBER_ID}/media`;

  const form = new FormData();

  const blob = new Blob([pdfBuffer], {
    type: "application/pdf",
  });

  form.append("messaging_product", "whatsapp");
  form.append("file", blob, "invoice.pdf");
  form.append("type", "application/pdf");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
    },
    body: form,
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("WhatsApp media upload error:", data);

    throw new Error(
      data?.error?.message || "WhatsApp media upload failed"
    );
  }

  return data;
}

export async function sendWhatsAppInvoice({
  to,
  pdfBuffer,
  invoiceNumber,
}) {
  if (!to) {
    throw new Error("WhatsApp recipient is required");
  }

  if (!pdfBuffer) {
    throw new Error("PDF buffer is required");
  }

  const media = await uploadWhatsAppDocument({
    pdfBuffer,
  });

  const message = {
    type: "document",
    document: {
      id: media.id,
      filename: `${invoiceNumber || "invoice"}.pdf`,
      caption: `📄 Invoice ${invoiceNumber || ""}`,
    },
  };

  return sendWhatsAppMessage({
    to,
    message,
  });
}
