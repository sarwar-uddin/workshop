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

export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
};

export async function getProducts(): Promise<Product[]> {
  const response = await fetch("/api/products");

  if (!response.ok) {
    throw new Error(`Failed to fetch products (${response.status})`);
  }

  const data: { products: Product[] } = await response.json();
  return data.products;
}
