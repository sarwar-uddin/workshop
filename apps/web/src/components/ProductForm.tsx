import { useEffect, useState } from 'react'

function ProductForm() {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [submittedName, setSubmittedName] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault()

  const response = await fetch('http://localhost:3000/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      price,
      category,
    }),
  })

  const data = await response.json()

  console.log(data)

  setSubmittedName(name)
  setName('')
  setPrice('')
  setCategory('')
}

  useEffect(() => {
  document.title = submittedName
    ? `Added: ${submittedName}`
    : 'Workshop'
}, [submittedName])

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
          />
        </label>

        <label>
          Price
          <input
            type="number"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
        </label>

        <label>
          Category
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">Select a category</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="other">Other</option>
          </select>
        </label>

        <button type="submit">Add product</button>
      </form>

      {submittedName && <p>Added: {submittedName}</p>}
    </section>
  )
}

export default ProductForm
