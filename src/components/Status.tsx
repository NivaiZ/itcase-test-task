import type { ReactNode } from 'react'
import { Link } from 'react-router'

type StatusProps = {
  title: string
  level?: 'h1' | 'h2'
  children?: ReactNode
  action?: ReactNode
}

export function Status({ title, level = 'h1', children, action }: StatusProps) {
  const Title = level

  return (
    <div className="status">
      <Title>{title}</Title>
      {children}
      {action}
    </div>
  )
}

type BackLinkProps = {
  to?: string
  children?: ReactNode
}

export function BackLink({ to = '/', children = 'Назад к списку' }: BackLinkProps) {
  return <Link className="back-link" to={to}>{children}</Link>
}
