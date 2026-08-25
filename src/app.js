import express from "express";
import cors from "cors";

const app = express();

app.use(
    cors({
        origin: true,
        credentials: true,
    })
);

app.use(express.json());

app.get("/api/v1/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "AI Distributor MVP backend is running",
    });
});

export default app;