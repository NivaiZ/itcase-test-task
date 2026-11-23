import { createContext, use, useCallback, useEffect, useMemo, useState } from 'react'
import { loadCart, sameLine, saveCart } from '../lib/cart'
import { resolvePromo } from '../lib/promo'
import { formatPrice } from '../lib/catalog'
import { useCatalog } from './CatalogContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => loadCart().items)
  const [promoCode, setPromoCode] = useState(() => {
    const stored = loadCart().promoCode
    return resolvePromo(stored)?.code ?? ''
  })

  useEffect(() => {
    saveCart({ items, promoCode })
  }, [items, promoCode])

  const addItem = useCallback((item) => {
    const nextItem = {
      productId: Number(item.productId),
      colorId: Number(item.colorId),
      sizeId: Number(item.sizeId),
      quantity: 1,
    }

    setItems((current) => {
      const index = current.findIndex((line) => sameLine(line, nextItem))
      if (index === -1) return [...current, nextItem]
      return current.map((line, lineIndex) => (
        lineIndex === index ? { ...line, quantity: line.quantity + 1 } : line
      ))
    })
  }, [])

  const setQuantity = useCallback((item, quantity) => {
    const nextQuantity = Math.max(1, Math.floor(Number(quantity) || 1))
    setItems((current) => current.map((line) => (
      sameLine(line, item) ? { ...line, quantity: nextQuantity } : line
    )))
  }, [])

  const removeItem = useCallback((item) => {
    setItems((current) => current.filter((line) => !sameLine(line, item)))
  }, [])

  const applyPromo = useCallback((code) => {
    const promo = resolvePromo(code)
    if (!promo) return null
    setPromoCode(promo.code)
    return promo
  }, [])

  const clearPromo = useCallback(() => {
    setPromoCode('')
  }, [])

  const value = useMemo(() => ({
    items,
    promoCode,
    addItem,
    setQuantity,
    removeItem,
    applyPromo,
    clearPromo,
  }), [items, promoCode, addItem, setQuantity, removeItem, applyPromo, clearPromo])

  return <CartContext value={value}>{children}</CartContext>
}

export function useCart() {
  const value = use(CartContext)
  if (!value) {
    throw new Error('useCart должен вызываться внутри CartProvider')
  }
  return value
}

export function useCartSummary() {
  const { items } = useCart()
  const { products, status } = useCatalog()
  const count = items.reduce((sum, item) => sum + item.quantity, 0)

  const subtotal = items.reduce((sum, item) => {
    const product = products.find((entry) => String(entry.id) === String(item.productId))
    const color = product?.colors.find((entry) => String(entry.id) === String(item.colorId))
    if (!color) return sum
    return sum + Number(color.price) * item.quantity
  }, 0)

  const pricesReady = status === 'ready' || count === 0

  return {
    count,
    subtotal,
    pricesReady,
    costLabel: pricesReady ? formatPrice(subtotal) : '…',
  }
}
