import { z } from "zod";

// Money arrives as a string so it never passes through a float:
// "1850", "1850.5" and "1850.50" are fine; "1e3", "-5" and "12.345" are not.
// Up to 10 digits before the point, to fit numeric(12,2).
const price = z
  .string()
  .trim()
  .regex(/^\d{1,10}(\.\d{1,2})?$/, "Price must be a non-negative amount with at most 2 decimals");

const sku = z.string().trim().min(1, "SKU is required").max(64);
const name = z.string().trim().min(1, "Name is required").max(200);
// An empty description means "no description", stored as NULL instead of "".
const description = z
  .string()
  .trim()
  .max(2000)
  .transform((value) => (value === "" ? null : value))
  .nullable();
const categoryId = z.uuid("Category id must be a UUID").nullable();

// strictObject rejects unknown keys. A client that sends `stockQuantity` gets
// a clear 400 instead of the field being silently dropped. Stock changes only
// through inventory adjustments (M9), so that each change has a ledger entry.
export const createProductSchema = z.strictObject({
  sku,
  name,
  description: description.optional(),
  categoryId: categoryId.optional(),
  price,
});

// PATCH: every field is optional, and archiving or restoring is allowed here.
export const updateProductSchema = z
  .strictObject({
    sku,
    name,
    description,
    categoryId,
    price,
    status: z.enum(["active", "archived"]),
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0, "Provide at least one field to update");

export const productIdParamsSchema = z.object({ id: z.uuid() });

export type CreateProductInput = z.output<typeof createProductSchema>;
export type UpdateProductInput = z.output<typeof updateProductSchema>;
