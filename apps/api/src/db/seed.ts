// Demo data for local development: `pnpm --filter @workshop/api db:seed`
//
// Safe to run repeatedly. Rows that already exist (matched by the unique
// category name / SKU indexes) are skipped instead of duplicated, and the whole
// seed runs in one transaction, so a failure part-way leaves the DB unchanged.

import { inArray } from "drizzle-orm";
import { db, pool } from "./client.js";
import { categories, products } from "./schema.js";

if (process.env.NODE_ENV === "production") {
  throw new Error("Refusing to seed a production database");
}

const categoryNames = ["Wallets", "Belts", "Bags", "Accessories"] as const;
type CategoryName = (typeof categoryNames)[number];

type SeedProduct = {
  sku: string;
  name: string;
  description?: string;
  category: CategoryName | null;
  price: string; // numeric: written as a string so it stays exact
  stockQuantity: number;
  status?: "active" | "archived";
};

const seedProducts: SeedProduct[] = [
  { sku: "WAL-BIF-01", name: "Bifold Wallet", category: "Wallets", price: "1850.00", stockQuantity: 14,
    description: "Saddle-stitched full-grain bifold, 6 card slots." },
  { sku: "WAL-CRD-01", name: "Card Holder", category: "Wallets", price: "950.00", stockQuantity: 22 },
  { sku: "WAL-LNG-01", name: "Long Wallet", category: "Wallets", price: "2600.00", stockQuantity: 3 },
  { sku: "BLT-CLS-32", name: "Classic Belt 32\"", category: "Belts", price: "2200.00", stockQuantity: 6 },
  { sku: "BLT-CLS-36", name: "Classic Belt 36\"", category: "Belts", price: "2200.00", stockQuantity: 0 },
  { sku: "BAG-TOT-01", name: "Tote Bag", category: "Bags", price: "6500.00", stockQuantity: 2,
    description: "Unlined tote, hand-burnished edges." },
  { sku: "BAG-MSG-01", name: "Messenger Bag", category: "Bags", price: "8900.00", stockQuantity: 1 },
  { sku: "ACC-KEY-01", name: "Key Fob", category: "Accessories", price: "450.00", stockQuantity: 40 },
  { sku: "ACC-WCH-20", name: "Watch Strap 20mm", category: "Accessories", price: "1200.00", stockQuantity: 9 },
  // Edge cases the UI should handle:
  { sku: "MISC-GIFT-01", name: "Gift Wrapping", category: null, price: "0.00", stockQuantity: 100 },
  { sku: "WAL-OLD-01", name: "Coin Pouch (discontinued)", category: "Wallets", price: "700.00", stockQuantity: 0,
    status: "archived" },
];

async function seed() {
  await db.transaction(async (tx) => {
    const insertedCategories = await tx
      .insert(categories)
      .values(categoryNames.map((name) => ({ name })))
      .onConflictDoNothing()
      .returning({ id: categories.id });

    // Look the IDs up by name, so this also works when the categories
    // already existed and nothing new was inserted.
    const categoryRows = await tx
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .where(inArray(categories.name, [...categoryNames]));
    const categoryIdByName = new Map(categoryRows.map((c) => [c.name, c.id]));

    const insertedProducts = await tx
      .insert(products)
      .values(
        seedProducts.map(({ category, ...p }) => ({
          ...p,
          categoryId: category === null ? null : categoryIdByName.get(category),
        })),
      )
      .onConflictDoNothing()
      .returning({ id: products.id });

    console.log(
      `Seeded ${insertedCategories.length}/${categoryNames.length} categories, ` +
        `${insertedProducts.length}/${seedProducts.length} products (the rest already existed)`,
    );
  });
}

try {
  await seed();
} finally {
  // Close the pool, otherwise its open connections keep the process alive.
  await pool.end();
}
