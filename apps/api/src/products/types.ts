export type ProductStatus = "active" | "archived";

// The shape the API sends to clients. It is deliberately not the raw database
// row: it nests the category and leaves out internal columns such as
// category_id, so the schema can change without breaking clients.
export type Product = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  // Exact decimal as a string, such as "1850.00". Never do maths on money as
  // JS floats; parse it only for display.
  price: string;
  stockQuantity: number;
  status: ProductStatus;
  category: { id: string; name: string } | null;
  createdAt: Date;
  updatedAt: Date;
};
