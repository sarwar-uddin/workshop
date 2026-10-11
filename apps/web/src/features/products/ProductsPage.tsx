import { useQuery } from '@tanstack/react-query'
import { getProducts } from '../../lib/api'
import ProductForm from './ProductForm'

function ProductsPage() {
  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  })

  return (
    <section>
      <h1>Products</h1>
      <ProductForm />

      <h2>Product list</h2>

      {productsQuery.isPending && <p>Loading products…</p>}

      {productsQuery.isError && (
        <p role="alert">
          Could not load products: {productsQuery.error.message}
        </p>
      )}

      {productsQuery.isSuccess && productsQuery.data.length === 0 && (
        <p>No products yet. Add your first product above.</p>
      )}

      {productsQuery.isSuccess && productsQuery.data.length > 0 && (
        <ul>
          {productsQuery.data.map((product) => (
            <li key={product.id}>
              {product.name} — {product.price.toFixed(2)} — {product.category}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default ProductsPage

