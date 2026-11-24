import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useProducts } from '../queries/catalog'
import { ProductCard } from '../components/ProductCard'
import { Status } from '../components/Status'
import { CatalogSkeleton } from '../components/Skeleton'
import { isInStock, minPrice } from '../lib/catalog'
import styles from './ProductList.module.css'

export function ProductListPage() {
  const productsQuery = useProducts()
  const products = productsQuery.data ?? []
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const inStockOnly = searchParams.get('stock') === '1'
  const sortParam = searchParams.get('sort')
  const sort = sortParam === 'asc' || sortParam === 'desc' ? sortParam : ''
  const [dimmed, setDimmed] = useState(false)
  const skipDim = useRef(true)

  function writeParams(change: (next: URLSearchParams) => void, replace: boolean) {
    const next = new URLSearchParams(searchParams)
    change(next)
    setSearchParams(next, { replace })
  }

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
    return <CatalogSkeleton />
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
      <form className={styles.controls} role="search" onSubmit={(event) => event.preventDefault()}>
        <label className={`${styles.field} ${styles.grow}`}>
          <span>Поиск</span>
          <input
            type="search"
            value={query}
            placeholder="Название товара"
            onChange={(event) => {
              const value = event.target.value
              writeParams((next) => {
                if (value) next.set('q', value)
                else next.delete('q')
              }, searchParams.has('q'))
            }}
          />
        </label>
        <div className={styles.field}>
          <span>Наличие</span>
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(event) => {
                const checked = event.target.checked
                writeParams((next) => {
                  if (checked) next.set('stock', '1')
                  else next.delete('stock')
                }, false)
              }}
            />
            В наличии
          </label>
        </div>
        <label className={styles.field}>
          <span>Сортировка</span>
          <span className={styles.select}>
            <select
              value={sort}
              onChange={(event) => {
                const value = event.target.value
                writeParams((next) => {
                  if (value === 'asc' || value === 'desc') next.set('sort', value)
                  else next.delete('sort')
                }, false)
              }}
            >
              <option value="">По умолчанию</option>
              <option value="asc">Сначала дешевле</option>
              <option value="desc">Сначала дороже</option>
            </select>
            <svg className={styles.chevron} viewBox="0 0 20 20" aria-hidden="true">
              <path
                d="M5 7.5 L10 12.5 L15 7.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </label>
      </form>

      {visible.length === 0 ? (
        <Status level="h2" title="Ничего не найдено">
          <p>Попробуйте другой запрос или снимите фильтр.</p>
        </Status>
      ) : (
        <ul className={dimmed ? `${styles.grid} ${styles.filtering}` : styles.grid}>
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
