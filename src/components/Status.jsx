import { Link } from 'react-router'

export function Status({ title, level = 'h1', children, action }) {
  const Title = level

  return (
    <div className="status">
      <Title>{title}</Title>
      {children}
      {action}
    </div>
  )
}

export function BackLink({ to = '/', children = 'Назад к списку' }) {
  return <Link className="back-link" to={to}>{children}</Link>
}
