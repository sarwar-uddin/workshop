import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createProduct } from '../../lib/api'

function ProductForm() {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [submittedName, setSubmittedName] = useState('')

  const queryClient = useQueryClient()

  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: async (data) => {
  setSubmittedName(data.product.name)
  setName('')
  setPrice('')
  setCategory('')

  await queryClient.invalidateQueries({
    queryKey: ['products'],
  })
},
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmittedName('')

    createProductMutation.mutate({
      name: name.trim(),
      price: Number(price),
      category,
    })
  }

  return (
    <section>
      <h2>Add product</h2>

      <form onSubmit={handleSubmit}>
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
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            required
          >
            <option value="">Select a category</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="other">Other</option>
          </select>
        </label>

        <button type="submit" disabled={createProductMutation.isPending}>
          {createProductMutation.isPending ? 'Adding…' : 'Add product'}
        </button>
      </form>

      {submittedName && <p>Added: {submittedName}</p>}

      {createProductMutation.isError && (
        <p role="alert">
          Error: {createProductMutation.error.message}
        </p>
      )}
    </section>
  )
}

export default ProductForm
