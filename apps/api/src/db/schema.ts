import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// Shared columns. uuidv7() is built into PostgreSQL 18: the IDs are
// time-ordered, so new rows go at the end of the primary-key index instead of
// landing at random places in it like v4 UUIDs do.
const id = () => uuid("id").primaryKey().default(sql`uuidv7()`);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const categories = pgTable(
  "categories",
  {
    id: id(),
    name: text("name").notNull(),
    ...timestamps,
  },
  (t) => [
    // "Wallets" and "wallets" are the same category.
    uniqueIndex("categories_name_lower_unique").on(sql`lower(${t.name})`),
    check("categories_name_not_blank", sql`btrim(${t.name}) <> ''`),
  ],
);

export const productStatus = pgEnum("product_status", ["active", "archived"]);

export const products = pgTable(
  "products",
  {
    id: id(),
    sku: text("sku").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    // Optional: a product does not have to be in a category.
    categoryId: uuid("category_id").references(() => categories.id, {
      // A category that still has products cannot be deleted. Move or
      // uncategorise them first, so nothing changes without anyone noticing.
      onDelete: "restrict",
    }),
    // numeric is exact decimal (no float rounding). The pg driver returns it
    // as a string such as "1250.00" so the value stays exact.
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    // Current stock. Later the stock_movements ledger explains how it got
    // here; both are updated in the same transaction.
    stockQuantity: integer("stock_quantity").notNull().default(0),
    // Products are archived, not deleted, once orders refer to them.
    status: productStatus("status").notNull().default("active"),
    ...timestamps,
  },
  (t) => [
    // SKUs are case-insensitive: "ABC-1" and "abc-1" are the same product.
    uniqueIndex("products_sku_lower_unique").on(sql`lower(${t.sku})`),
    // Postgres does not index foreign keys automatically.
    index("products_category_id_idx").on(t.categoryId),
    check("products_sku_not_blank", sql`btrim(${t.sku}) <> ''`),
    check("products_name_not_blank", sql`btrim(${t.name}) <> ''`),
    check("products_price_non_negative", sql`${t.price} >= 0`),
    check("products_stock_non_negative", sql`${t.stockQuantity} >= 0`),
  ],
);
