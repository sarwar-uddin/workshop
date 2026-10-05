import express from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./errors/errorHandler.js";

const app = express();

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`API listening on port ${env.port}`);
});
