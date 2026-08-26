import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
//console.log(apiKey);

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not configured");
}

const ai = new GoogleGenAI({
  apiKey,
});

const commandSchema = {
  type: "object",

  properties: {
    intent: {
      type: "string",
      enum: [
        "create_order",
        "confirm_order",
        "record_payment",
        "check_order",
        "check_invoice",
      ],
    },

    customerPhone: {
      type: "string",
    },

    items: {
      type: "array",

      items: {
        type: "object",

        properties: {
          productName: {
            type: "string",
          },

          quantity: {
            type: "number",
          },

          unit: {
            type: "string",
          },
        },

        required: ["productName", "quantity", "unit"],
      },
    },

    invoiceId: {
      type: "string",
    },

    orderId: {
      type: "string",
    },

    amount: {
      type: "number",
    },

    gateway: {
      type: "string",
    },

    gatewayPaymentId: {
      type: "string",
    },

    status: {
      type: "string",
      enum: ["pending", "successful", "failed"],
    },

    notes: {
      type: "string",
    },
  },

  required: [
    "intent",
    "customerPhone",
    "items",
    "invoiceId",
    "orderId",
    "amount",
    "gateway",
    "gatewayPaymentId",
    "status",
    "notes",
  ],
};

const SYSTEM_PROMPT = `
You are the AI command parser for an AI Distributor ERP.

Your job is ONLY to convert distributor/customer messages
into a structured business command.

You MUST NOT invent information.

Supported intents:

1. create_order
Use when the user wants to place/order products.

2. confirm_order
Use ONLY when the user clearly confirms an existing
order request.

3. record_payment
Use when the user reports that a payment was made.

4. check_order
Use when the user asks about an order.

5. check_invoice
Use when the user asks about an invoice.

Rules:

- Extract customer phone when explicitly available.
- Extract product name exactly as spoken when possible.
- Extract quantity.
- Extract unit.
- Do not invent product IDs.
- Do not invent invoice IDs.
- Do not invent order IDs.
- Do not invent payment IDs.
- Do not invent payment amounts.
- If information is missing, use an empty string where allowed
  by the schema.
- For create_order, do NOT assume confirmation.
- "I need 20 Parle G" means create_order.
- "Yes confirm it" means confirm_order only when there is
  enough conversation context.
- Return ONLY JSON matching the provided schema.

Examples:

User:
"Ramesh needs 20 cartons of Parle G"

Output:
{
  "intent": "create_order",
  "customerPhone": "",
  "items": [
    {
      "productName": "Parle G",
      "quantity": 20,
      "unit": "carton"
    }
  ],
  "invoiceId": "",
  "orderId": "",
  "amount": 0,
  "gateway": "",
  "gatewayPaymentId": "",
  "status": "",
  "notes": ""
}

User:
"Ramesh confirmed the 20 cartons of Parle G"

Output:
{
  "intent": "confirm_order",
  "customerPhone": "",
  "items": [
    {
      "productName": "Parle G",
      "quantity": 20,
      "unit": "carton"
    }
  ],
  "invoiceId": "",
  "orderId": "",
  "amount": 0,
  "gateway": "",
  "gatewayPaymentId": "",
  "status": "",
  "notes": ""
}
`;

export async function parseDistributorMessage(message) {
  if (!message || typeof message !== "string") {
    throw new Error("Message must be a non-empty string");
  }

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",

    contents: [
      {
        role: "user",
        parts: [
          {
            text: `
${SYSTEM_PROMPT}

USER MESSAGE:
${message}
`,
          },
        ],
      },
    ],

    config: {
      responseMimeType: "application/json",

      responseSchema: commandSchema,

      temperature: 0,
    },
  });

  if (!response.text) {
    throw new Error("Gemini returned an empty response");
  }

  try {
    return JSON.parse(response.text);
  } catch (error) {
    throw new Error("Gemini returned invalid JSON");
  }
}
