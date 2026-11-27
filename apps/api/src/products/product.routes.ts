import { Router } from "express";
import { listProducts } from "./product.repository.js";

export const productRouter = Router();

// Express 5 sends a rejected promise from an async handler (for example, the
// database being down) to the error handler, so no try/catch is needed here.
productRouter.get("/", async (_req, res) => {
  const products = await listProducts();
  res.json({ products });
});
