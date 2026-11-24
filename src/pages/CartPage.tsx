import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { BackLink, Status } from '../components/Status'
import { CartSkeleton } from '../components/Skeleton'
import { useCartHydrated, useCartSummary } from '../hooks/useCart'
import { useProducts, useSizes } from '../queries/catalog'
import { useCartStore } from '../store/useCartStore'
import { formatPrice } from '../lib/catalog'
import { quoteCart } from '../lib/promo'
import type { CartLine, Product, Size } from '../types/catalog'
import { toast } from '../components/Toaster'
import ui from '../styles/ui.module.css'
import styles from './CartPage.module.css'

function resolveLine(item: CartLine, products: Product[], sizes: Size[]) {
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
  const items = useCartStore((state) => state.items)
  const promoCode = useCartStore((state) => state.promoCode)
  const setQuantity = useCartStore((state) => state.setQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const applyPromo = useCartStore((state) => state.applyPromo)
  const clearPromo = useCartStore((state) => state.clearPromo)
  const { count, subtotal } = useCartSummary()
  const hydrated = useCartHydrated()
  const productsQuery = useProducts()
  const sizesQuery = useSizes()
  const products = productsQuery.data ?? []
  const sizes = sizesQuery.data ?? []
  const [draft, setDraft] = useState(promoCode)
  const [invalid, setInvalid] = useState(false)

  useEffect(() => {
    if (hydrated) setDraft(promoCode)
  }, [hydrated, promoCode])

  const quote = quoteCart(subtotal, promoCode)

  function handlePromo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft.trim()) {
      setInvalid(true)
      toast.error('Введите промокод')
      return
    }
    const promo = applyPromo(draft)
    if (!promo) {
      setInvalid(true)
      toast.error('Такой промокод не действует')
      return
    }
    setDraft(promo.code)
    setInvalid(false)
    toast.success(`${promo.title} применена`)
  }

  function handleClearPromo() {
    clearPromo()
    setDraft('')
    setInvalid(false)
  }

  if (!hydrated) {
    return <CartSkeleton />
  }

  if (items.length === 0) {
    return (
      <Status title="Корзина пуста" action={<Link className={`${ui.primary} ${ui.linkButton}`} to="/">Перейти в каталог</Link>}>
        <p>Добавьте товар, и он появится здесь.</p>
      </Status>
    )
  }

  if (productsQuery.isPending || sizesQuery.isPending) {
    return <CartSkeleton />
  }

  if (productsQuery.isError || sizesQuery.isError) {
    const error = productsQuery.error ?? sizesQuery.error
    return (
      <Status
        title="Не удалось открыть корзину"
        action={(
          <button
            type="button"
            onClick={() => {
              productsQuery.refetch()
              sizesQuery.refetch()
            }}
          >
            Повторить
          </button>
        )}
      >
        <p>{error?.message ?? 'Попробуйте ещё раз.'}</p>
      </Status>
    )
  }

  return (
    <section className={styles.cart}>
      <BackLink />
      <h1>Корзина</h1>
      <p className={ui.muted}>{count} шт.</p>
      <ul className={styles.list}>
        {items.map((item) => {
          const line = resolveLine(item, products, sizes)
          const key = `${item.productId}-${item.colorId}-${item.sizeId}`

          if (!line) {
            return (
              <li key={key} className={styles.line}>
                <div>
                  <h2>Позиция недоступна</h2>
                  <button type="button" className={ui.textButton} onClick={() => removeItem(item)}>Удалить</button>
                </div>
              </li>
            )
          }

          return (
            <li key={key} className={styles.line}>
              <Link to={`/product/${line.product.id}?color=${line.color.id}&size=${line.size.id}`} className={styles.media}>
                {line.image ? <img src={line.image} alt="" /> : <span>Нет фото</span>}
              </Link>
              <div className={styles.copy}>
                <h2>
                  <Link to={`/product/${line.product.id}?color=${line.color.id}&size=${line.size.id}`}>
                    {line.product.name}
                  </Link>
                </h2>
                <p>Цвет: {line.color.name}</p>
                <p>Размер: {line.size.name} ({line.size.number})</p>
                <p>Цена: {formatPrice(line.price)}</p>
                <p>Сумма: {formatPrice(line.sum)}</p>
                <div className={styles.qty}>
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
                  <button type="button" className={ui.textButton} onClick={() => removeItem(item)}>Удалить</button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      <form className={styles.promo} onSubmit={handlePromo}>
        <div className={styles.promoRow}>
          <label className={`${ui.field} ${ui.grow}`}>
            <span>Промокод</span>
            <input
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value)
                if (invalid) setInvalid(false)
              }}
              placeholder="SALE10 или MINUS50"
              autoComplete="off"
              aria-invalid={invalid || undefined}
            />
          </label>
          <button type="submit">Применить</button>
          {promoCode && (
            <button type="button" className={ui.textButton} onClick={handleClearPromo}>Убрать</button>
          )}
        </div>
      </form>

      <dl className={styles.totals}>
        <div>
          <dt>Сумма</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        {quote.promo && (
          <div className={styles.discount}>
            <dt>{quote.promo.title}</dt>
            <dd>−{formatPrice(quote.discount)}</dd>
          </div>
        )}
        <div className={styles.grand}>
          <dt>Итого</dt>
          <dd>{formatPrice(quote.total)}</dd>
        </div>
      </dl>
    </section>
  )
}
