const STORAGE_KEY = 'itcase-cart'

export function sameLine(left, right) {
  return String(left.productId) === String(right.productId)
    && String(left.colorId) === String(right.colorId)
    && String(left.sizeId) === String(right.sizeId)
}

export function sanitizeItems(items) {
  if (!Array.isArray(items)) return []

  return items.flatMap((item) => {
    const productId = Number(item?.productId)
    const colorId = Number(item?.colorId)
    const sizeId = Number(item?.sizeId)
    const quantity = Math.floor(Number(item?.quantity))
    const ids = [productId, colorId, sizeId]

    if (!ids.every((id) => Number.isInteger(id) && id > 0)) return []
    if (!Number.isInteger(quantity) || quantity < 1) return []

    return [{ productId, colorId, sizeId, quantity }]
  })
}

export function loadCart() {
  const empty = { items: [], promoCode: '' }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return empty

    const data = JSON.parse(raw)
    const promo = typeof data.promoCode === 'string' ? data.promoCode.trim().toUpperCase() : ''

    return {
      items: sanitizeItems(data.items),
      promoCode: promo,
    }
  } catch {
    return empty
  }
}

export function saveCart(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    items: sanitizeItems(state.items),
    promoCode: state.promoCode ?? '',
  }))
}
