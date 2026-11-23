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
