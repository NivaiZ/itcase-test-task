const PROMOS = {
  SALE10: { type: 'percent', amount: 10, title: 'Скидка 10%' },
  MINUS50: { type: 'fixed', amount: 50, title: 'Скидка 50' },
}

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function resolvePromo(code) {
  const key = String(code ?? '').trim().toUpperCase()
  const promo = PROMOS[key]
  if (!promo) return null
  return { code: key, ...promo }
}

export function quoteCart(subtotal, code) {
  const safeSubtotal = roundMoney(Math.max(0, Number(subtotal) || 0))
  const promo = code ? resolvePromo(code) : null

  if (!promo) {
    return { promo: null, discount: 0, total: safeSubtotal }
  }

  const rawDiscount = promo.type === 'percent'
    ? safeSubtotal * (promo.amount / 100)
    : promo.amount
  const discount = roundMoney(Math.min(Math.max(rawDiscount, 0), safeSubtotal))

  return {
    promo,
    discount,
    total: roundMoney(safeSubtotal - discount),
  }
}
