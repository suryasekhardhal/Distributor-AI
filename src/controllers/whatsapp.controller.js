import { processDistributorMessage } from "../services/ai.service.js";

import { handleWhatsAppAction } from "../services/whatsappAction.service.js";

import { sendWhatsAppMessage } from "../services/whatsappApi.service.js";

import {
  buildTextMessage,
} from "../services/whatsappMessage.service.js";

export async function verifyWhatsAppWebhook(req, res) {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("\n========== WHATSAPP VERIFICATION ==========");
  console.log("Mode:", mode);
  console.log("Token received:", token);
  console.log(
    "Token configured:",
    !!process.env.WHATSAPP_VERIFY_TOKEN
  );
  console.log(
    "Configured token length:",
    process.env.WHATSAPP_VERIFY_TOKEN?.length
  );
  console.log(
    "Received token length:",
    token?.length
  );
  console.log(
    "Token matches:",
    token === process.env.WHATSAPP_VERIFY_TOKEN
  );
  console.log("Challenge:", challenge);

  if (
    mode === "subscribe" &&
    token === process.env.WHATSAPP_VERIFY_TOKEN
  ) {
    return res.status(200).send(challenge);
  }

  return res.status(403).json({
    message: "Webhook verification failed",
  });
}

export async function receiveWhatsAppMessage(req, res) {
      console.log("\n🔥 POST WEBHOOK HIT 🔥");

    console.log("METHOD:", req.method);
    console.log("URL:", req.originalUrl);
    console.log("HEADERS:", req.headers);
  try {
    const body = req.body;

    console.log("\n========== WHATSAPP WEBHOOK ==========");

    console.dir(body, { depth: null });

    /*
     * We acknowledge the webhook immediately.
     * Meta should not wait for our AI/business logic.
     */

    res.status(200).json({
      received: true,
    });

    // -----------------------------------------
    // Ignore non-message events
    // -----------------------------------------

    const change = body?.entry?.[0]?.changes?.[0];

    const value = change?.value;

    if (!value) {
      return;
    }

    const message = value?.messages?.[0];

    if (!message) {
      return;
    }

    const customerPhone = message.from;
    const customerName = value?.contacts?.[0]?.profile?.name || "";

    // -----------------------------------------
    // TEXT MESSAGE
    // -----------------------------------------

    if (message.type === "text") {
      const text = message.text?.body;

      if (!text) {
        return;
      }

      /*
       * IMPORTANT:
       *
       * companyId will eventually be resolved
       * from the WhatsApp business number /
       * connected account.
       *
       * For MVP testing we temporarily use
       * WHATSAPP_COMPANY_ID.
       */

      const companyId = process.env.WHATSAPP_COMPANY_ID;

      const result = await processDistributorMessage({
        companyId,
        customerPhone,
        customerName,
        message: text,
      });

      console.log("\nAI RESULT:");

      console.dir(result, { depth: null });

      // -----------------------------------------
      // ORDER CONFIRMATION
      // -----------------------------------------

      if (result?.confirmation?.message) {
        await sendWhatsAppMessage({
          to: customerPhone,

          message: result.confirmation.message,
        });

        return;
      }

      // -----------------------------------------
      // NORMAL TEXT RESPONSE
      // -----------------------------------------

      const responseText =
        result?.message || "I could not process your request.";

      await sendWhatsAppMessage({
        to: customerPhone,

        message: buildTextMessage({
          text: responseText,
        }),
      });

      /*
       * NEXT STEP:
       *
       * Send `result` back through WhatsApp.
       *
       * We will implement the actual Meta
       * API sender next.
       */

      return;
    }

    // -----------------------------------------
    // BUTTON RESPONSE
    // -----------------------------------------

    if (message.type === "interactive") {
      const actionId = message.interactive?.button_reply?.id;

      if (!actionId) {
        return;
      }

      const companyId = process.env.WHATSAPP_COMPANY_ID;

      const result = await handleWhatsAppAction({
        companyId,

        customerPhone,

        actionId,
      });

      console.log("\nWHATSAPP ACTION RESULT:");

      console.dir(result, { depth: null });
      const responseText =
        result?.message ||
        (result?.status === "confirmed"
          ? "✅ Order confirmed successfully."
          : result?.status === "cancelled"
            ? "❌ Order cancelled."
            : "Request processed.");

      await sendWhatsAppMessage({
        to: customerPhone,

        message: buildTextMessage({
          text: responseText,
        }),
      });

      return;
    }
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
  }
}
