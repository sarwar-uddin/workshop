import express from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./errors/errorHandler.js";
import { randomUUID } from "node:crypto";
import { productRouter } from "./products/product.routes.js";

// TEMPORARY (until issue #9): POST still writes to this in-memory array, so
// products created through the form do not appear in GET, which now reads
// from Postgres. #9 moves create into the repository and removes all of this.
type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
};

const products: Product[] = [];

const app = express();

app.use(express.json());

app.use("/api/products", productRouter);

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
