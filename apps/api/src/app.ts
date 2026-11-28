// Builds the Express app without starting a server. index.ts calls listen()
// for real use; tests hand the app straight to Supertest, which binds it to a
// random free port per request, so tests never collide with a running dev API.

import express from "express";
import { categoryRouter } from "./categories/category.routes.js";
import { errorHandler } from "./errors/errorHandler.js";
import { productRouter } from "./products/product.routes.js";

export const app = express();

app.use(express.json());

// Liveness only: "the process is up and serving HTTP". It doesn't touch the
// database, so a DB outage shows up as 500s on real routes, not a dead probe.
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);

// Registered last: Express only reaches it when a route above throws or rejects.
app.use(errorHandler);
