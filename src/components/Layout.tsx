import { useEffect } from 'react'
import { NavLink, Outlet, useMatches } from 'react-router'
import { useCartSummary } from '../hooks/useCart'
import { useProduct } from '../queries/catalog'
import type { AppHandle } from '../types/route'

function useRouteLabel() {
  const matches = useMatches()
  const match = [...matches].reverse().find((item) => {
    const handle = item.handle as AppHandle | undefined
    return Boolean(handle?.title)
  })
  const handle = match?.handle as AppHandle | undefined
  const productQuery = useProduct(match?.params.productId)

  if (!handle) return 'Каталог'
  if (typeof handle.title === 'function') return handle.title(productQuery.data?.name)
  return handle.title
}

export function Layout() {
  const { count, costLabel, hydrated } = useCartSummary()
  const label = useRouteLabel()

  useEffect(() => {
    document.title = label === 'Каталог' ? 'Каталог' : `${label} · Каталог`
  }, [label])

  return (
    <div className="shell">
      <header className="header">
        {label !== 'Каталог' && <NavLink to="/" className="brand">{label}</NavLink>}
        <NavLink
          to="/cart"
          className={({ isActive }) => (isActive ? 'cart-link active' : 'cart-link')}
          aria-label={`Корзина, ${hydrated ? `${count} шт.` : '…'} на сумму ${costLabel}`}
        >
          <span>Корзина</span>
          <strong>{hydrated ? `${count} шт.` : '…'}</strong>
          <strong>{costLabel}</strong>
        </NavLink>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
