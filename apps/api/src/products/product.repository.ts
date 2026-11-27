// Persistence for products: the only module that knows how products are stored.
// Routes call these functions and never build queries themselves.

import { asc, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { categories, products } from "../db/schema.js";
import type { Product } from "./types.js";

export async function listProducts(): Promise<Product[]> {
  const rows = await db
    .select({
      id: products.id,
      sku: products.sku,
      name: products.name,
      description: products.description,
      price: products.price,
      stockQuantity: products.stockQuantity,
      status: products.status,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
      categoryId: categories.id,
      categoryName: categories.name,
    })
    .from(products)
    // LEFT JOIN, not INNER JOIN: an inner join would silently drop every
    // product that has no category.
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(asc(products.name));

  return rows.map(({ categoryId, categoryName, ...product }) => ({
    ...product,
    category:
      categoryId !== null && categoryName !== null
        ? { id: categoryId, name: categoryName }
        : null,
  }));
}
