import express from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./errors/errorHandler.js";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/products", (req, res) => {
  const { name, price, category } = req.body;

  res.status(201).json({
    message: "Product received",
    product: {
      name,
      price,
      category,
    },
  });
});

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`API listening on port ${env.port}`);
});
