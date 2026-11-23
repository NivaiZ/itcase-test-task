import { BackLink, Status } from '../components/Status'

export function NotFoundPage() {
  return (
    <Status title="Страница не найдена" action={<BackLink />}>
      <p>Проверьте адрес или вернитесь в каталог.</p>
    </Status>
  )
}
