import { Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import { ProductListPage } from './pages/ProductListPage'
import { ProductPage } from './pages/ProductPage'
import { CartPage } from './pages/CartPage'
import { NotFoundPage } from './pages/NotFoundPage'

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<ProductListPage />} />
        <Route path="product/:productId" element={<ProductPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
