import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { BackLink, Status } from '../components/Status'
import { useCart, useCartSummary } from '../context/CartContext'
import { useCatalog } from '../context/CatalogContext'
import { formatPrice } from '../lib/catalog'
import { quoteCart } from '../lib/promo'

function resolveLine(item, products, sizes) {
  const product = products.find((entry) => String(entry.id) === String(item.productId))
  const color = product?.colors.find((entry) => String(entry.id) === String(item.colorId))
  const size = sizes.find((entry) => String(entry.id) === String(item.sizeId))
  if (!product || !color || !size) return null

  const price = Number(color.price)
  return {
    item,
    product,
    color,
    size,
    price,
    sum: price * item.quantity,
    image: color.images[0],
  }
}

export function CartPage() {
  const { items, promoCode, setQuantity, removeItem, applyPromo, clearPromo } = useCart()
  const { count, subtotal } = useCartSummary()
  const { status, products, sizes, error, retry } = useCatalog()
  const [draft, setDraft] = useState(promoCode)
  const [message, setMessage] = useState('')

  useEffect(() => {
    document.title = 'Корзина · Каталог'
  }, [])

  const quote = quoteCart(subtotal, promoCode)

  function handlePromo(event) {
    event.preventDefault()
    if (!draft.trim()) {
      setMessage('Введите промокод')
      return
    }
    const promo = applyPromo(draft)
    if (!promo) {
      setMessage('Такой промокод не действует')
      return
    }
    setDraft(promo.code)
    setMessage(`${promo.title} применена`)
  }

  function handleClearPromo() {
    clearPromo()
    setDraft('')
    setMessage('')
  }

  if (items.length === 0) {
    return (
      <Status title="Корзина пуста" action={<Link className="primary link-button" to="/">Перейти в каталог</Link>}>
        <p>Добавьте товар, и он появится здесь.</p>
      </Status>
    )
  }

  if (status === 'loading') {
    return <Status title="Загрузка корзины" />
  }

  if (status === 'error') {
    return (
      <Status
        title="Не удалось открыть корзину"
        action={<button type="button" onClick={retry}>Повторить</button>}
      >
        <p>{error?.message ?? 'Попробуйте ещё раз.'}</p>
      </Status>
    )
  }

  return (
    <section className="cart">
      <BackLink />
      <h1>Корзина</h1>
      <p className="muted">{count} шт.</p>
      <ul className="cart-list">
        {items.map((item) => {
          const line = resolveLine(item, products, sizes)
          const key = `${item.productId}-${item.colorId}-${item.sizeId}`

          if (!line) {
            return (
              <li key={key} className="cart-line">
                <div>
                  <h2>Позиция недоступна</h2>
                  <button type="button" className="text-button" onClick={() => removeItem(item)}>Удалить</button>
                </div>
              </li>
            )
          }

          return (
            <li key={key} className="cart-line">
              <Link to={`/product/${line.product.id}?color=${line.color.id}&size=${line.size.id}`} className="cart-media">
                {line.image ? <img src={line.image} alt="" /> : <span>Нет фото</span>}
              </Link>
              <div className="cart-copy">
                <h2>
                  <Link to={`/product/${line.product.id}?color=${line.color.id}&size=${line.size.id}`}>
                    {line.product.name}
                  </Link>
                </h2>
                <p>Цвет: {line.color.name}</p>
                <p>Размер: {line.size.name} ({line.size.number})</p>
                <p>Цена: {formatPrice(line.price)}</p>
                <p>Сумма: {formatPrice(line.sum)}</p>
                <div className="qty">
                  <button
                    type="button"
                    onClick={() => setQuantity(item, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    aria-label="Уменьшить количество"
                  >
                    −
                  </button>
                  <span aria-live="polite">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(item, item.quantity + 1)}
                    aria-label="Увеличить количество"
                  >
                    +
                  </button>
                  <button type="button" className="text-button" onClick={() => removeItem(item)}>Удалить</button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      <form className="promo" onSubmit={handlePromo}>
        <label className="field grow">
          <span>Промокод</span>
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="SALE10 или MINUS50"
            autoComplete="off"
          />
        </label>
        <button type="submit">Применить</button>
        {promoCode && (
          <button type="button" className="text-button" onClick={handleClearPromo}>Убрать</button>
        )}
        {message && <p className="notice" role="status">{message}</p>}
      </form>

      <dl className="totals">
        <div>
          <dt>Сумма</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        {quote.promo && (
          <div>
            <dt>{quote.promo.title}</dt>
            <dd>−{formatPrice(quote.discount)}</dd>
          </div>
        )}
        <div className="grand">
          <dt>Итого</dt>
          <dd>{formatPrice(quote.total)}</dd>
        </div>
      </dl>
    </section>
  )
}
