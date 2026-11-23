import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { getCategories, getProduct, getSizes } from '../services/api'
import { Gallery } from '../components/Gallery'
import { BackLink, Status } from '../components/Status'
import { useCart } from '../context/CartContext'
import { formatPrice, swatchColor } from '../lib/catalog'

function colorHasSize(color, sizeId) {
  return color.sizes.some((id) => String(id) === String(sizeId))
}

export function ProductPage() {
  const { productId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { addItem } = useCart()
  const [requestId, setRequestId] = useState(0)
  const [state, setState] = useState({ status: 'loading' })
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let ignore = false
    setState({ status: 'loading' })
    setNotice('')

    getProduct(productId)
      .then((product) => Promise.all([product, getSizes(), getCategories()]))
      .then(([product, sizes, categories]) => {
        if (ignore) return
        const category = categories.find((item) => String(item.id) === String(product.categoryId)) ?? null
        setState({ status: 'ready', product, sizes, category })
      })
      .catch((error) => {
        if (ignore) return
        const notFound = /not found/i.test(String(error?.message ?? ''))
        setState(notFound ? { status: 'not-found' } : { status: 'error', error })
      })

    return () => {
      ignore = true
    }
  }, [productId, requestId])

  const product = state.status === 'ready' ? state.product : null
  const selectedColor = product
    ? product.colors.find((color) => String(color.id) === searchParams.get('color'))
      ?? product.colors.find((color) => color.sizes.length > 0)
      ?? product.colors[0]
    : null

  useEffect(() => {
    if (!product || !selectedColor) return

    const sizeId = searchParams.get('size')
    const colorMatches = searchParams.get('color') === String(selectedColor.id)
    const sizeOk = !sizeId || colorHasSize(selectedColor, sizeId)
    if (colorMatches && sizeOk) return

    const next = new URLSearchParams(searchParams)
    next.set('color', String(selectedColor.id))
    if (!sizeOk) next.delete('size')
    setSearchParams(next, { replace: true })
  }, [product, selectedColor, searchParams, setSearchParams])

  useEffect(() => {
    document.title = product ? `${product.name} · Каталог` : 'Каталог'
  }, [product])

  if (state.status === 'loading') {
    return <Status title="Загрузка товара" />
  }

  if (state.status === 'not-found') {
    return (
      <Status title="Товар не найден" action={<BackLink />}>
        <p>Такой позиции нет в каталоге.</p>
      </Status>
    )
  }

  if (state.status === 'error' || !product || !selectedColor) {
    return (
      <Status
        title="Не удалось загрузить товар"
        action={<button type="button" onClick={() => setRequestId((current) => current + 1)}>Повторить</button>}
      >
        <p>{state.error?.message ?? 'Попробуйте ещё раз.'}</p>
      </Status>
    )
  }

  const sizeId = searchParams.get('size')
  const selectedSize = state.sizes.find((size) => (
    String(size.id) === sizeId && colorHasSize(selectedColor, size.id)
  )) ?? null
  const canBuy = Boolean(selectedSize)
  const soldOut = selectedColor.sizes.length === 0

  function selectColor(color) {
    setNotice('')
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.set('color', String(color.id))
      const currentSize = next.get('size')
      if (currentSize && !colorHasSize(color, currentSize)) next.delete('size')
      return next
    }, { replace: true })
  }

  function selectSize(size) {
    setNotice('')
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.set('color', String(selectedColor.id))
      next.set('size', String(size.id))
      return next
    }, { replace: true })
  }

  function handleAdd() {
    if (!selectedSize) return
    addItem({
      productId: product.id,
      colorId: selectedColor.id,
      sizeId: selectedSize.id,
    })
    setNotice('Добавлено в корзину')
  }

  return (
    <article className="product">
      <BackLink />
      <div className="product-layout">
        <Gallery
          key={selectedColor.id}
          images={selectedColor.images}
          alt={`${product.name}, ${selectedColor.name}`}
        />
        <div className="product-info">
          <p className="muted">{state.category?.name} · {product.brand}</p>
          <h1>{product.name}</h1>
          <p className="price price-lg">{formatPrice(selectedColor.price)}</p>
          <p>{selectedColor.description}</p>

          <fieldset className="choice">
            <legend>Цвет</legend>
            <div className="choice-row">
              {product.colors.map((color) => {
                const pressed = color.id === selectedColor.id
                return (
                  <button
                    key={color.id}
                    type="button"
                    className={pressed ? 'color-button selected' : 'color-button'}
                    aria-pressed={pressed}
                    onClick={() => selectColor(color)}
                  >
                    <span className="swatch" style={{ background: swatchColor(color.name) }} />
                    {color.name}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <fieldset className="choice">
            <legend>Размер</legend>
            <div className="choice-row">
              {state.sizes.map((size) => {
                const available = colorHasSize(selectedColor, size.id)
                const pressed = selectedSize?.id === size.id
                return (
                  <button
                    key={size.id}
                    type="button"
                    className={pressed ? 'size-button selected' : 'size-button'}
                    disabled={!available}
                    aria-pressed={pressed}
                    onClick={() => selectSize(size)}
                  >
                    {size.name}
                    <small>{size.number}</small>
                  </button>
                )
              })}
            </div>
          </fieldset>

          <button type="button" className="primary" disabled={!canBuy} onClick={handleAdd}>
            {soldOut ? 'Нет в наличии' : 'Добавить в корзину'}
          </button>
          {!soldOut && !selectedSize && <p className="muted">Выберите размер</p>}
          {notice && <p className="notice" role="status">{notice}</p>}
        </div>
      </div>
    </article>
  )
}
