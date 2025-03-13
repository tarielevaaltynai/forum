/*
import cn from 'classnames'
import css from './index.module.scss'
import { Link } from 'react-router-dom'

export type ButtonProps={
  children: React.ReactNode
  loading?: boolean
  variant?: 'blue' | 'white-with-blue-border' // Добавляем варианты для кнопки
}
export const Button = ({ children, loading = false, variant = 'blue' }: ButtonProps) => {
  return (
    <button
      className={cn(
        css.button, // Общий стиль кнопки
        css[variant], // Стиль, выбранный по variant
        { [css.disabled]: loading } // Применяем стиль disabled, если кнопка в загрузке
      )}
      type="submit"
      disabled={loading}
    >
      {loading ? 'Отправляется...' : children}
    </button>
  )
}
export const LinkButton = ({ children, to }: { children: React.ReactNode; to: string }) => {
  return (
    <Link className={cn({ [css.button]: true })} to={to}>
      {children}
    </Link>
  )
}*/
import cn from 'classnames'
import css from './index.module.scss'
import { Link } from 'react-router-dom'

export type ButtonProps={
  children: React.ReactNode
  loading?: boolean
  variant?: 'blue' | 'white-with-blue-border' // Добавляем варианты для кнопки
}
export const Button = ({ children, loading = false, variant = 'blue' }: ButtonProps) => {
  return (
    <button
      className={cn({ [css.button]: true,[css[variant]]:true, [css.disabled]: loading})}
      type="submit"
      disabled={loading}
    >
      <span className={css.text}>{children}</span>
    </button>
  )
}
export const LinkButton = ({ children, to }: { children: React.ReactNode; to: string }) => {
  return (
    <Link className={cn({ [css.button]: true })} to={to}>
      {children}
    </Link>
  )
}