import { Route, Routes } from 'react-router'
import AppLayout from '../layouts/AppLayout'
import DashboardPage from '../features/dashboard/DashboardPage'
import ProductsPage from '../features/products/ProductsPage'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
      </Route>
    </Routes>
  )
}

export default App
