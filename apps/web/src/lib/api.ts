// Typed client for the Workshop API. Every request goes through `request`,
// so error handling stays the same for all endpoints.

export type ApiErrorDetail = { path: string; message: string }

// Thrown for any non-2xx response. It carries the API's error code and the
// per-field details, so a form can show "SKU already taken" next to the SKU
// input.
// (Plain fields instead of `constructor(public readonly ...)`: this project's
// `erasableSyntaxOnly` setting forbids TS syntax that generates runtime code.)
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details: ApiErrorDetail[]

  constructor(status: number, code: string, message: string, details: ApiErrorDetail[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })

  if (!response.ok) {
    // The body may not be our JSON error (e.g. a proxy's HTML 502 page).
    const body = await response.json().catch(() => null)
    throw new ApiError(
      response.status,
      body?.error?.code ?? 'HTTP_ERROR',
      body?.error?.message ?? `Request failed (${response.status})`,
      body?.error?.details,
    )
  }

  return response.json() as Promise<T>
}

// Mirrors the API's Product. Dates arrive as ISO strings, since JSON has no
// Date type.
export type Product = {
  id: string
  sku: string
  name: string
  description: string | null
  price: string // exact decimal, e.g. "1850.00"
  stockQuantity: number
  status: 'active' | 'archived'
  category: { id: string; name: string } | null
  createdAt: string
  updatedAt: string
}

export type Category = { id: string; name: string }

export type CreateProductInput = {
  sku: string
  name: string
  price: string
  categoryId: string | null
  description?: string
}

export async function getProducts(): Promise<Product[]> {
  const data = await request<{ products: Product[] }>('/api/products')
  return data.products
}

export async function getCategories(): Promise<Category[]> {
  const data = await request<{ categories: Category[] }>('/api/categories')
  return data.categories
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const data = await request<{ product: Product }>('/api/products', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return data.product
}
