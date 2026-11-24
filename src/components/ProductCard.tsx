import { Link } from 'react-router'
import { formatPrice, isInStock, minPrice } from '../lib/catalog'
import type { Product } from '../types/catalog'
import ui from '../styles/ui.module.css'
import styles from './ProductCard.module.css'

type ProductCardProps = {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const price = minPrice(product)
  const pricesDiffer = product.colors.some((color) => Number(color.price) !== price)
  const image = product.colors[0]?.images[0]
  const available = isInStock(product)

  return (
    <Link to={`/product/${product.id}`} className={styles.card}>
      <div className={styles.media}>
        {image ? <img src={image} alt="" /> : <span className={styles.empty}>Нет фото</span>}
      </div>
      <div className={styles.body}>
        <h2>{product.name}</h2>
        <p className={ui.muted}>{product.brand}</p>
        <p className={ui.price}>{pricesDiffer ? `от ${formatPrice(price)}` : formatPrice(price)}</p>
        {!available && <p className={ui.badge}>Нет в наличии</p>}
      </div>
    </Link>
  )
}
