import { createContext, use, useEffect, useState } from 'react'
import { getProducts, getSizes } from '../services/api'

const CatalogContext = createContext(null)

export function CatalogProvider({ children }) {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({
    status: 'loading',
    products: [],
    sizes: [],
    error: null,
  })

  useEffect(() => {
    let ignore = false
    setState((current) => ({ ...current, status: 'loading', error: null }))

    Promise.all([getProducts(), getSizes()])
      .then(([products, sizes]) => {
        if (ignore) return
        setState({ status: 'ready', products, sizes, error: null })
      })
      .catch((error) => {
        if (ignore) return
        setState({ status: 'error', products: [], sizes: [], error })
      })

    return () => {
      ignore = true
    }
  }, [attempt])

  const value = {
    ...state,
    retry() {
      setAttempt((current) => current + 1)
    },
  }

  return <CatalogContext value={value}>{children}</CatalogContext>
}

export function useCatalog() {
  const value = use(CatalogContext)
  if (!value) {
    throw new Error('useCatalog должен вызываться внутри CatalogProvider')
  }
  return value
}
