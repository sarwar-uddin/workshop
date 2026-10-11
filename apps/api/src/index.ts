import express from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./errors/errorHandler.js";
import { randomUUID } from "node:crypto";

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
};

const products: Product[] = [];

const app = express();

app.use(express.json());

app.get("/api/products", (_req, res) => {
  res.json({ products });
});

app.post("/api/products", (req, res) => {
  const { name, price, category } = req.body;

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof price !== "number" ||
    !Number.isFinite(price) ||
    price < 0 ||
    typeof category !== "string" ||
    !category
  ) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid product data",
      },
    });
    return;
  }

  const product: Product = {
    id: randomUUID(),
    name: name.trim(),
    price,
    category,
  };

  products.push(product);

  res.status(201).json({
    message: "Product created",
    product,
  });
});

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`API listening on port ${env.port}`);
});
