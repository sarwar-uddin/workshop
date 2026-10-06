import { useState } from 'react'
import Header from './components/Header'
import DashboardCard from './components/DashboardCard'
import ProductForm from './components/ProductForm'
import './App.css'

function App() {
  const [message, setMessage] = useState('Ready to work.')

  function handleAction() {
    setMessage('You clicked the button.')
  }

  return (
    <div>
      <Header userName="Admin" />

      <main>
        <h2>Dashboard</h2>

        <div>
          <DashboardCard
            title="Products"
            value="24"
            description="Products currently in the catalog."
          />

          <DashboardCard
            title="Customers"
            value="18"
            description="Customers currently recorded."
          />

          <DashboardCard
            title="Orders"
            value="7"
            description="Orders currently in the system."
          />
        </div>
	
	<ProductForm />

        <p>{message}</p>

        <button type="button" onClick={handleAction}>
          Test interaction
        </button>
      </main>
    </div>
  )
}

export default App
