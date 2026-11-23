import { Link } from 'react-router'
import { formatPrice, isInStock, minPrice } from '../lib/catalog'

export function ProductCard({ product }) {
  const price = minPrice(product)
  const pricesDiffer = product.colors.some((color) => Number(color.price) !== price)
  const image = product.colors[0]?.images[0]
  const available = isInStock(product)

  return (
    <Link to={`/product/${product.id}`} className="card">
      <div className="card-media">
        {image ? <img src={image} alt="" /> : <span className="gallery-empty">Нет фото</span>}
      </div>
      <div className="card-body">
        <h2>{product.name}</h2>
        <p className="muted">{product.brand}</p>
        <p className="price">{pricesDiffer ? `от ${formatPrice(price)}` : formatPrice(price)}</p>
        {!available && <p className="badge">Нет в наличии</p>}
      </div>
    </Link>
  )
}
