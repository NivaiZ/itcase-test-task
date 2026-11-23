import { NavLink, Outlet } from 'react-router'
import { useCartSummary } from '../context/CartContext'

export function Layout() {
  const { count, costLabel } = useCartSummary()

  return (
    <div className="shell">
      <header className="header">
        <NavLink to="/" className="brand">Каталог</NavLink>
        <NavLink
          to="/cart"
          className={({ isActive }) => (isActive ? 'cart-link active' : 'cart-link')}
          aria-label={`Корзина, ${count} шт. на сумму ${costLabel}`}
        >
          <span>Корзина</span>
          <strong>{count} шт.</strong>
          <strong>{costLabel}</strong>
        </NavLink>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
