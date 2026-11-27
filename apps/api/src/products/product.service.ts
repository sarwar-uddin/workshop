// Business rules for products. This layer translates what the database says
// ("constraint X violated") into what the API means ("that SKU is taken").
//
// We do not check "does the SKU exist?" before inserting: two requests could
// both pass the check and then both insert. The unique index is the real
// guarantee, so we attempt the write and interpret the error.

import { AppError } from "../errors/AppError.js";
import { getPgError, PG_FOREIGN_KEY_VIOLATION, PG_UNIQUE_VIOLATION } from "../db/errors.js";
import * as repo from "./product.repository.js";
import type { CreateProductInput, UpdateProductInput } from "./product.schemas.js";
import type { Product } from "./types.js";

function translateWriteError(error: unknown): never {
  const pgError = getPgError(error);

  if (pgError?.code === PG_UNIQUE_VIOLATION && pgError.constraint === "products_sku_lower_unique") {
    throw new AppError("SKU_TAKEN", "Another product already uses this SKU", 409, [
      { path: "sku", message: "SKU must be unique (case-insensitive)" },
    ]);
  }

  if (pgError?.code === PG_FOREIGN_KEY_VIOLATION) {
    throw new AppError("CATEGORY_NOT_FOUND", "The selected category does not exist", 400, [
      { path: "categoryId", message: "Unknown category" },
    ]);
  }

  throw error; // Unexpected: let the error handler log it and return 500.
}

function notFound(): AppError {
  return new AppError("PRODUCT_NOT_FOUND", "Product not found", 404);
}

export async function getProduct(id: string): Promise<Product> {
  const product = await repo.findProductById(id);
  if (!product) throw notFound();
  return product;
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  let id: string;
  try {
    id = await repo.insertProduct(input);
  } catch (error) {
    translateWriteError(error);
  }
  return getProduct(id);
}

export async function updateProduct(id: string, changes: UpdateProductInput): Promise<Product> {
  let found: boolean;
  try {
    found = await repo.updateProductById(id, changes);
  } catch (error) {
    translateWriteError(error);
  }
  if (!found) throw notFound();
  return getProduct(id);
}
