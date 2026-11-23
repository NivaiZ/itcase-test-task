import type { Product } from '../types/catalog'

export const COLOR_SWATCH: Record<string, string> = {
  черный: '#161616',
  белый: '#f7f7f7',
  серый: '#b5b5b5',
  желтый: '#e2a400',
  синий: '#243e73',
  бежевый: '#d9c3a1',
  хаки: '#6d7034',
  графит: '#3e434c',
}

export function formatPrice(value: number | string) {
  const number = Number(value)
  if (!Number.isFinite(number)) return '—'
  return `${number.toFixed(2)} ₽`
}

export function minPrice(product: Product) {
  const prices = product.colors
    .map((color) => Number(color.price))
    .filter(Number.isFinite)

  if (!prices.length) return 0
  return Math.min(...prices)
}

export function isInStock(product: Product) {
  return product.colors.some(
    (color) => Array.isArray(color.sizes) && color.sizes.length > 0,
  )
}

export function swatchColor(name: string) {
  return COLOR_SWATCH[name] ?? '#d5d5d5'
}
