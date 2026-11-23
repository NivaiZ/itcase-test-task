import type { CartLine } from '../types/catalog'

export function sameLine(
  left: Pick<CartLine, 'productId' | 'colorId' | 'sizeId'>,
  right: Pick<CartLine, 'productId' | 'colorId' | 'sizeId'>,
) {
  return String(left.productId) === String(right.productId)
    && String(left.colorId) === String(right.colorId)
    && String(left.sizeId) === String(right.sizeId)
}

export function sanitizeItems(items: unknown): CartLine[] {
  if (!Array.isArray(items)) return []

  return items.flatMap((item) => {
    if (!item || typeof item !== 'object') return []

    const record = item as Record<string, unknown>
    const productId = Number(record.productId)
    const colorId = Number(record.colorId)
    const sizeId = Number(record.sizeId)
    const quantity = Math.floor(Number(record.quantity))
    const ids = [productId, colorId, sizeId]

    if (!ids.every((id) => Number.isInteger(id) && id > 0)) return []
    if (!Number.isInteger(quantity) || quantity < 1) return []

    return [{ productId, colorId, sizeId, quantity }]
  })
}
