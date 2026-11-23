import { createBrowserRouter } from 'react-router'
import { Layout } from './components/Layout'
import { ProductListPage } from './pages/ProductListPage'
import { ProductPage } from './pages/ProductPage'
import { CartPage } from './pages/CartPage'
import { NotFoundPage } from './pages/NotFoundPage'
import type { AppHandle } from './types/route'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <ProductListPage />,
        handle: { title: 'Каталог' } satisfies AppHandle,
      },
      {
        path: 'product/:productId',
        element: <ProductPage />,
        handle: { title: (productName) => productName ?? 'Товар' } satisfies AppHandle,
      },
      {
        path: 'cart',
        element: <CartPage />,
        handle: { title: 'Корзина' } satisfies AppHandle,
      },
      {
        path: '*',
        element: <NotFoundPage />,
        handle: { title: 'Страница не найдена' } satisfies AppHandle,
      },
    ],
  },
])
