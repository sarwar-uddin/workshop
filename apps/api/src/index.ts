import express from "express";
import { categoryRouter } from "./categories/category.routes.js";
import { env } from "./config/env.js";
import { errorHandler } from "./errors/errorHandler.js";
import { productRouter } from "./products/product.routes.js";

const app = express();

app.use(express.json());

app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`API listening on port ${env.port}`);
});
