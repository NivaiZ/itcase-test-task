import { NavLink, Outlet } from 'react-router'
import { useCartSummary } from '../hooks/useCart'

export function Layout() {
  const { count, costLabel, hydrated } = useCartSummary()

  return (
    <div className="shell">
      <header className="header">
        <NavLink to="/" className="brand">Каталог</NavLink>
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
