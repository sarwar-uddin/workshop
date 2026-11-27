// Minimal form wired to the real API. Issue #11 rebuilds it with React Hook
// Form + Zod; for now it keeps main working and shows the API's field errors.

import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, createProduct, getCategories } from '../../lib/api'

function ProductForm() {
  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [submittedName, setSubmittedName] = useState('')

  const queryClient = useQueryClient()

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: async (product) => {
      setSubmittedName(product.name)
      setSku('')
      setName('')
      setPrice('')
      setCategoryId('')

      await queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmittedName('')

    createProductMutation.mutate({
      sku,
      name,
      // Send the input's string as-is. Number("1850.10") would be a float, and
      // the API wants the exact decimal text.
      price,
      categoryId: categoryId === '' ? null : categoryId,
    })
  }

  const error = createProductMutation.error
  const fieldErrors = error instanceof ApiError ? error.details : []

  return (
    <section>
      <h2>Add product</h2>

      <form onSubmit={handleSubmit}>
        <label>
          SKU
          <input
            type="text"
            value={sku}
            onChange={(event) => setSku(event.target.value)}
            required
          />
        </label>

        <label>
          Product name
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>

        <label>
          Price
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            required
          />
        </label>

        <label>
          Category
          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            disabled={categoriesQuery.isPending}
          >
            <option value="">No category</option>
            {categoriesQuery.data?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <button type="submit" disabled={createProductMutation.isPending}>
          {createProductMutation.isPending ? 'Adding…' : 'Add product'}
        </button>
      </form>

      {submittedName && <p>Added: {submittedName}</p>}

      {categoriesQuery.isError && (
        <p role="alert">Could not load categories: {categoriesQuery.error.message}</p>
      )}

      {error && (
        <div role="alert">
          <p>Error: {error.message}</p>
          {fieldErrors.length > 0 && (
            <ul>
              {fieldErrors.map((detail) => (
                <li key={detail.path + detail.message}>
                  {detail.path || 'form'}: {detail.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}

export default ProductForm
