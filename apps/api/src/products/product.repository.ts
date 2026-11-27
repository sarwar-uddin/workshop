// Persistence for products: the only module that knows how products are stored.
// It returns API-shaped Products, but business rules live in the service.

import { asc, eq, type SQL } from "drizzle-orm";
import { db } from "../db/client.js";
import { categories, products } from "../db/schema.js";
import type { CreateProductInput, UpdateProductInput } from "./product.schemas.js";
import type { Product } from "./types.js";

// One SELECT shape for every read, so list and detail can never drift apart.
async function selectProducts(where?: SQL): Promise<Product[]> {
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
    .where(where)
    .orderBy(asc(products.name));

  return rows.map(({ categoryId, categoryName, ...product }) => ({
    ...product,
    category:
      categoryId !== null && categoryName !== null
        ? { id: categoryId, name: categoryName }
        : null,
  }));
}

export function listProducts(): Promise<Product[]> {
  return selectProducts();
}

export async function findProductById(id: string): Promise<Product | undefined> {
  const [product] = await selectProducts(eq(products.id, id));
  return product;
}

// Insert and update return only the id. The caller reloads the product through
// findProductById to get the joined category.
export async function insertProduct(input: CreateProductInput): Promise<string> {
  const [row] = await db
    .insert(products)
    .values(input)
    .returning({ id: products.id });
  return row!.id;
}

export async function updateProductById(
  id: string,
  changes: UpdateProductInput,
): Promise<boolean> {
  const rows = await db
    .update(products)
    .set(changes)
    .where(eq(products.id, id))
    .returning({ id: products.id });
  return rows.length > 0;
}
