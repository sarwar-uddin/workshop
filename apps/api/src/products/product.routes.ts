// HTTP layer only: parse and validate the request, call the service, choose the
// status code. No SQL and no business rules here.
//
// Express 5 sends a rejected promise from an async handler (a thrown
// AppError, the database being down) to the error handler, so no try/catch is
// needed here.

import { Router } from "express";
import { AppError } from "../errors/AppError.js";
import { parseInput } from "../validation/parse.js";
import { listProducts } from "./product.repository.js";
import { createProductSchema, productIdParamsSchema, updateProductSchema } from "./product.schemas.js";
import * as productService from "./product.service.js";

export const productRouter = Router();

// A malformed id can never match a product, so answer 404 instead of letting
// Postgres fail to cast it to uuid (which would be a 500).
function parseProductId(params: unknown): string {
  const result = productIdParamsSchema.safeParse(params);
  if (!result.success) throw new AppError("PRODUCT_NOT_FOUND", "Product not found", 404);
  return result.data.id;
}

productRouter.get("/", async (_req, res) => {
  res.json({ products: await listProducts() });
});

productRouter.get("/:id", async (req, res) => {
  const product = await productService.getProduct(parseProductId(req.params));
  res.json({ product });
});

productRouter.post("/", async (req, res) => {
  const input = parseInput(createProductSchema, req.body);
  const product = await productService.createProduct(input);
  res.status(201).location(`/api/products/${product.id}`).json({ product });
});

productRouter.patch("/:id", async (req, res) => {
  const id = parseProductId(req.params);
  const changes = parseInput(updateProductSchema, req.body);
  const product = await productService.updateProduct(id, changes);
  res.json({ product });
});
