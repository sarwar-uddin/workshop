import type { Product, ProductStatus } from "./types.js";

const status: ProductStatus = "active";

const product: Product = {
  id: "prod_001",
  name: "Leather Card Holder",
  sku: "LCH-001",
  price: 1200,
  status,
};

console.log(product);

function getProductLabel(product: Product): string {
  if (product.status === "active") {
    return `${product.name} (${product.sku})`;
  }

  return `${product.name} [archived]`;
}

console.log(getProductLabel(product));
