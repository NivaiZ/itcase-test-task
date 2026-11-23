import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { sameLine, sanitizeItems } from '../lib/cart'
import { resolvePromo } from '../lib/promo'

const STORAGE_KEY = 'itcase-cart'

const cartStorage = {
  getItem(name) {
    try {
      const raw = localStorage.getItem(name)
      if (!raw) return null

      const parsed = JSON.parse(raw)
      const payload = parsed?.state ?? parsed

      return {
        state: {
          items: payload?.items ?? [],
          promoCode: payload?.promoCode ?? '',
        },
        version: parsed?.version ?? 0,
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

export const useCartStore = create(
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
        return {
          ...current,
          items: sanitizeItems(persisted?.items),
          promoCode: resolvePromo(persisted?.promoCode)?.code ?? '',
        }
      },
    },
  ),
)
