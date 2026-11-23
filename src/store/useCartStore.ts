import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PersistStorage, StorageValue } from 'zustand/middleware'
import { sameLine, sanitizeItems } from '../lib/cart'
import { resolvePromo } from '../lib/promo'
import type { CartLine, Promo } from '../types/catalog'

const STORAGE_KEY = 'itcase-cart'

type PersistedCart = {
  items: CartLine[]
  promoCode: string
}

type CartState = PersistedCart & {
  addItem: (item: Omit<CartLine, 'quantity'>) => void
  setQuantity: (item: Pick<CartLine, 'productId' | 'colorId' | 'sizeId'>, quantity: number) => void
  removeItem: (item: Pick<CartLine, 'productId' | 'colorId' | 'sizeId'>) => void
  applyPromo: (code: string) => Promo | null
  clearPromo: () => void
}

const cartStorage: PersistStorage<PersistedCart> = {
  getItem(name) {
    try {
      const raw = localStorage.getItem(name)
      if (!raw) return null

      const parsed = JSON.parse(raw) as StorageValue<PersistedCart> | PersistedCart
      const payload = 'state' in parsed ? parsed.state : parsed

      return {
        state: {
          items: payload?.items ?? [],
          promoCode: payload?.promoCode ?? '',
        },
        version: 'version' in parsed ? parsed.version ?? 0 : 0,
      }
    } catch {
      return null
    }
  },
  setItem(name, value) {
    localStorage.setItem(name, JSON.stringify(value))
  },
  removeItem(name) {
    localStorage.removeItem(name)
  },
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      promoCode: '',
      addItem(item) {
        const nextItem = {
          productId: Number(item.productId),
          colorId: Number(item.colorId),
          sizeId: Number(item.sizeId),
          quantity: 1,
        }

        set((state) => {
          const index = state.items.findIndex((line) => sameLine(line, nextItem))
          if (index === -1) return { items: [...state.items, nextItem] }
          return {
            items: state.items.map((line, lineIndex) => (
              lineIndex === index ? { ...line, quantity: line.quantity + 1 } : line
            )),
          }
        })
      },
      setQuantity(item, quantity) {
        const nextQuantity = Math.max(1, Math.floor(Number(quantity) || 1))
        set((state) => ({
          items: state.items.map((line) => (
            sameLine(line, item) ? { ...line, quantity: nextQuantity } : line
          )),
        }))
      },
      removeItem(item) {
        set((state) => ({
          items: state.items.filter((line) => !sameLine(line, item)),
        }))
      },
      applyPromo(code) {
        const promo = resolvePromo(code)
        if (!promo) return null
        set({ promoCode: promo.code })
        return promo
      },
      clearPromo() {
        set({ promoCode: '' })
      },
    }),
    {
      name: STORAGE_KEY,
      storage: cartStorage,
      partialize: (state) => ({
        items: state.items,
        promoCode: state.promoCode,
      }),
      merge(persisted, current) {
        const stored = persisted as Partial<PersistedCart> | undefined
        return {
          ...current,
          items: sanitizeItems(stored?.items),
          promoCode: resolvePromo(stored?.promoCode)?.code ?? '',
        }
      },
    },
  ),
)
