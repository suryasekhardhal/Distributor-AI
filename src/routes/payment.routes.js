import { Router } from "express";
import { createPayment,verifyPayment ,createPaymentRequestController} from "../controllers/payment.controller.js";
//import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.post(
    "/",
    createPayment
);

router.post(
    "/verify",
    verifyPayment
);

router.post("/request",createPaymentRequestController)

export default router;