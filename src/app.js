import express from "express";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json());

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Distributor MVP backend is running",
  });
});

import whatsappRoutes from "./routes/whatsapp.routes.js";
import orderRoutes from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import customerRoutes from "./routes/customer.routes.js";

app.use("/api/v1/whatsapp", whatsappRoutes);

app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/customer", customerRoutes);

export default app;
