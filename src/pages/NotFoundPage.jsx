import { useEffect } from 'react'
import { BackLink, Status } from '../components/Status'

export function NotFoundPage() {
  useEffect(() => {
    document.title = 'Страница не найдена · Каталог'
  }, [])

  return (
    <Status title="Страница не найдена" action={<BackLink />}>
      <p>Проверьте адрес или вернитесь в каталог.</p>
    </Status>
  )
}
