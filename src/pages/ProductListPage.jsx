import { useEffect, useMemo, useRef, useState } from 'react'
import { useProducts } from '../queries/catalog'
import { ProductCard } from '../components/ProductCard'
import { Status } from '../components/Status'
import { isInStock, minPrice } from '../lib/catalog'

export function ProductListPage() {
  const productsQuery = useProducts()
  const products = productsQuery.data ?? []
  const [query, setQuery] = useState('')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [sort, setSort] = useState('')
  const [dimmed, setDimmed] = useState(false)
  const skipDim = useRef(true)

  useEffect(() => {
    document.title = 'Каталог'
  }, [])

  useEffect(() => {
    if (skipDim.current) {
      skipDim.current = false
      return
    }

    setDimmed(true)
    const timer = window.setTimeout(() => setDimmed(false), 420)
    return () => window.clearTimeout(timer)
  }, [query, sort])

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const filtered = products.filter((product) => {
      const matchesQuery = product.name.toLowerCase().includes(normalized)
      const matchesStock = !inStockOnly || isInStock(product)
      return matchesQuery && matchesStock
    })

    if (sort !== 'asc' && sort !== 'desc') return filtered

    return [...filtered].sort((left, right) => {
      const diff = minPrice(left) - minPrice(right)
      return sort === 'asc' ? diff : -diff
    })
  }, [products, query, inStockOnly, sort])

  if (productsQuery.isPending) {
    return <Status title="Загрузка каталога" />
  }

  if (productsQuery.isError) {
    return (
      <Status
        title="Не удалось загрузить каталог"
        action={<button type="button" onClick={() => productsQuery.refetch()}>Повторить</button>}
      >
        <p>{productsQuery.error?.message ?? 'Попробуйте ещё раз.'}</p>
      </Status>
    )
  }

  return (
    <>
      <h1>Каталог</h1>
      <form className="controls" role="search" onSubmit={(event) => event.preventDefault()}>
        <label className="field grow">
          <span>Поиск</span>
          <input
            type="search"
            value={query}
            placeholder="Название товара"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className="field check-field">
          <span>Наличие</span>
          <label className="check">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(event) => setInStockOnly(event.target.checked)}
            />
            В наличии
          </label>
        </div>
        <label className="field">
          <span>Сортировка</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="">По умолчанию</option>
            <option value="asc">Сначала дешевле</option>
            <option value="desc">Сначала дороже</option>
          </select>
        </label>
      </form>

      {visible.length === 0 ? (
        <Status level="h2" title="Ничего не найдено">
          <p>Попробуйте другой запрос или снимите фильтр.</p>
        </Status>
      ) : (
        <ul className={dimmed ? 'product-grid is-filtering' : 'product-grid'}>
          {visible.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
