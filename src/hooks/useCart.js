import { useEffect, useState } from 'react'
import { formatPrice } from '../lib/catalog'
import { useProducts } from '../queries/catalog'
import { useCartStore } from '../store/useCartStore'

export function useCartHydrated() {
  const [hydrated, setHydrated] = useState(() => useCartStore.persist.hasHydrated())

  useEffect(() => {
    const finish = () => setHydrated(true)
    const unsubscribe = useCartStore.persist.onFinishHydration(finish)
    finish()
    return unsubscribe
  }, [])

  return hydrated
}

export function useCartSummary() {
  const items = useCartStore((state) => state.items)
  const hydrated = useCartHydrated()
  const productsQuery = useProducts()
  const count = items.reduce((sum, item) => sum + item.quantity, 0)

  const subtotal = items.reduce((sum, item) => {
    const product = productsQuery.data?.find((entry) => String(entry.id) === String(item.productId))
    const color = product?.colors.find((entry) => String(entry.id) === String(item.colorId))
    if (!color) return sum
    return sum + Number(color.price) * item.quantity
  }, 0)

  const pricesReady = productsQuery.isSuccess || count === 0

  return {
    count,
    subtotal,
    hydrated,
    costLabel: hydrated && pricesReady ? formatPrice(subtotal) : '…',
  }
}
