// Test data builders. Tests arrange rows directly in the database (fast, and
// independent of the endpoint under test), then act and assert over HTTP.

import { db } from "../src/db/client.js";
import { categories, products } from "../src/db/schema.js";

export async function insertCategory(name = "Wallets") {
  const [row] = await db.insert(categories).values({ name }).returning();
  return row!;
}

let skuCounter = 0;

export async function insertProduct(overrides: Partial<typeof products.$inferInsert> = {}) {
  skuCounter += 1;
  const [row] = await db
    .insert(products)
    .values({
      sku: `TEST-${skuCounter}`,
      name: `Test product ${skuCounter}`,
      price: "100.00",
      ...overrides,
    })
    .returning();
  return row!;
}
