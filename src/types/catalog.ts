export type Size = {
  id: number
  name: string
  number: number
}

export type Category = {
  id: number
  name: string
}

export type ProductColor = {
  id: number
  name: string
  images: string[]
  price: string
  description: string
  sizes: number[]
}

export type Product = {
  id: number
  name: string
  categoryId: number
  brand: string
  colors: ProductColor[]
}

export type CartLine = {
  productId: number
  colorId: number
  sizeId: number
  quantity: number
}

export type Promo = {
  code: string
  type: 'percent' | 'fixed'
  amount: number
  title: string
}
