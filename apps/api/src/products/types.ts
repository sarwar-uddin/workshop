export type ProductStatus = "active" | "archived";

export type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  status: ProductStatus;
};
