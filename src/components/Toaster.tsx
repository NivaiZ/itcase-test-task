import { useEffect, useState } from 'react'
import styles from './Toaster.module.css'

type ToastTone = 'success' | 'error'

type ToastItem = {
  id: number
  message: string
  tone: ToastTone
}

type Listener = (items: ToastItem[]) => void

const listeners = new Set<Listener>()
const timers = new Map<number, number>()
let items: ToastItem[] = []
let nextId = 1

function emit() {
  const snapshot = items
  listeners.forEach((listener) => listener(snapshot))
}

function dismiss(id: number) {
  const timer = timers.get(id)
  if (timer) window.clearTimeout(timer)
  timers.delete(id)
  items = items.filter((item) => item.id !== id)
  emit()
}

function show(message: string, tone: ToastTone = 'success', duration = 4000) {
  const id = nextId
  nextId += 1
  const next = [...items, { id, message, tone }]
  const dropped = next.slice(0, Math.max(0, next.length - 3))
  dropped.forEach((item) => {
    const timer = timers.get(item.id)
    if (timer) window.clearTimeout(timer)
    timers.delete(item.id)
  })
  items = next.slice(-3)
  emit()
  timers.set(id, window.setTimeout(() => dismiss(id), duration))
  return id
}

export const toast = Object.assign(
  (message: string) => show(message),
  {
    success: (message: string) => show(message, 'success'),
    error: (message: string) => show(message, 'error'),
    dismiss: (id?: number) => {
      if (id === undefined) {
        ;[...items].forEach((item) => dismiss(item.id))
        return
      }
      dismiss(id)
    },
  },
)

export function Toaster() {
  const [current, setCurrent] = useState(items)

  useEffect(() => {
    listeners.add(setCurrent)
    return () => {
      listeners.delete(setCurrent)
    }
  }, [])

  return (
    <div className={styles.region} role="region" aria-label="Уведомления">
      {current.map((item) => (
        <div key={item.id} className={item.tone === 'error' ? `${styles.toast} ${styles.error}` : styles.toast} role={item.tone === 'error' ? 'alert' : 'status'}>
          <span>{item.message}</span>
          <button type="button" className={styles.close} onClick={() => toast.dismiss(item.id)} aria-label="Закрыть">
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
