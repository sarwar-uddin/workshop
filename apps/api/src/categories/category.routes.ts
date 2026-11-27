// Read-only for now: the product form needs real categories to choose from.
// Creating and renaming categories can come when there's a UI for it.

import { asc } from "drizzle-orm";
import { Router } from "express";
import { db } from "../db/client.js";
import { categories } from "../db/schema.js";

export const categoryRouter = Router();

// One query, no rules, so it doesn't need its own repository/service files
// yet. Split it out when categories gain create/update.
categoryRouter.get("/", async (_req, res) => {
  const rows = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .orderBy(asc(categories.name));
  res.json({ categories: rows });
});
