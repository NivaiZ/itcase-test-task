import { useQuery } from '@tanstack/react-query'
import { getCategories, getProduct, getProducts, getSizes } from '../services/api'

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  })
}

export function useSizes() {
  return useQuery({
    queryKey: ['sizes'],
    queryFn: getSizes,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })
}

export function useProduct(id) {
  return useQuery({
    queryKey: ['product', String(id)],
    queryFn: () => getProduct(id),
  })
}
