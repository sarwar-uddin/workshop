export type CreateProductInput = {
  name: string
  price: number
  category: string
}

export type CreateProductResponse = {
  message: string
  product: Product
}

export async function createProduct(
  input: CreateProductInput,
): Promise<CreateProductResponse> {
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error(`Failed to create product (${response.status})`)
  }

  return response.json() as Promise<CreateProductResponse>
}

// Mirrors the API's Product. Dates arrive as ISO strings, since JSON has no
// Date type.
export type Product = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  price: string; // exact decimal, e.g. "1850.00"
  stockQuantity: number;
  status: "active" | "archived";
  category: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
};

export async function getProducts(): Promise<Product[]> {
  const response = await fetch("/api/products");

  if (!response.ok) {
    throw new Error(`Failed to fetch products (${response.status})`);
  }

  const data: { products: Product[] } = await response.json();
  return data.products;
}
