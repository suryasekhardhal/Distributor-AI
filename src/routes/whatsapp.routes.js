import { Router } from "express";

import {
    verifyWhatsAppWebhook,
    receiveWhatsAppMessage,
} from "../controllers/whatsapp.controller.js";

const router =
    Router();

router.get(
    "/webhook",
    verifyWhatsAppWebhook
);

router.post(
    "/webhook",
    receiveWhatsAppMessage
);

export default router;