import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { Gallery } from '../components/Gallery'
import { BackLink, Status } from '../components/Status'
import { useCartStore } from '../store/useCartStore'
import { useCategories, useProduct, useSizes } from '../queries/catalog'
import { formatPrice, swatchColor } from '../lib/catalog'
import type { ProductColor, Size } from '../types/catalog'

function colorHasSize(color: ProductColor, sizeId: string | number) {
  return color.sizes.some((id) => String(id) === String(sizeId))
}

export function ProductPage() {
  const { productId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const addItem = useCartStore((state) => state.addItem)
  const productQuery = useProduct(productId)
  const sizesQuery = useSizes()
  const categoriesQuery = useCategories()
  const [notice, setNotice] = useState('')

  const product = productQuery.data
  const sizes = sizesQuery.data ?? []
  const category = categoriesQuery.data?.find((item) => String(item.id) === String(product?.categoryId)) ?? null
  const notFound = productQuery.isError && /not found/i.test(String(productQuery.error?.message ?? ''))

  useEffect(() => {
    setNotice('')
  }, [productId])
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

  if (notFound) {
    return (
      <Status title="Товар не найден" action={<BackLink />}>
        <p>Такой позиции нет в каталоге.</p>
      </Status>
    )
  }

  if (productQuery.isPending || sizesQuery.isPending || categoriesQuery.isPending) {
    return <Status title="Загрузка товара" />
  }

  if (productQuery.isError || sizesQuery.isError || categoriesQuery.isError || !product || !selectedColor) {
    const error = productQuery.error ?? sizesQuery.error ?? categoriesQuery.error
    return (
      <Status
        title="Не удалось загрузить товар"
        action={(
          <button
            type="button"
            onClick={() => {
              productQuery.refetch()
              sizesQuery.refetch()
              categoriesQuery.refetch()
            }}
          >
            Повторить
          </button>
        )}
      >
        <p>{error?.message ?? 'Попробуйте ещё раз.'}</p>
      </Status>
    )
  }

  const activeProduct = product
  const activeColor = selectedColor
  const sizeId = searchParams.get('size')
  const selectedSize = sizes.find((size) => (
    String(size.id) === sizeId && colorHasSize(activeColor, size.id)
  )) ?? null
  const canBuy = Boolean(selectedSize)
  const soldOut = activeColor.sizes.length === 0

  function selectColor(color: ProductColor) {
    setNotice('')
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.set('color', String(color.id))
      const currentSize = next.get('size')
      if (currentSize && !colorHasSize(color, currentSize)) next.delete('size')
      return next
    }, { replace: true })
  }

  function selectSize(size: Size) {
    setNotice('')
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.set('color', String(activeColor.id))
      next.set('size', String(size.id))
      return next
    }, { replace: true })
  }

  function handleAdd() {
    if (!selectedSize) return
    addItem({
      productId: activeProduct.id,
      colorId: activeColor.id,
      sizeId: selectedSize.id,
    })
    setNotice('Добавлено в корзину')
  }

  return (
    <article className="product">
      <BackLink />
      <div className="product-layout">
        <Gallery
          key={activeColor.id}
          images={activeColor.images}
          alt={`${activeProduct.name}, ${activeColor.name}`}
        />
        <div className="product-info">
          <p className="muted">{category?.name} · {activeProduct.brand}</p>
          <h1>{activeProduct.name}</h1>
          <p className="price price-lg">{formatPrice(activeColor.price)}</p>
          <p>{activeColor.description}</p>

          <fieldset className="choice">
            <legend>Цвет</legend>
            <div className="choice-row">
              {activeProduct.colors.map((color) => {
                const pressed = color.id === activeColor.id
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
              {sizes.map((size) => {
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
