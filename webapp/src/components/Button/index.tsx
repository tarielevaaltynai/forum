/*import cn from 'classnames'
import css from './index.module.scss'

export const Button = ({ children, loading = false }: { children: React.ReactNode; loading?: boolean }) => {
  return (
    <button className={cn({ [css.button]: true, [css.disabled]: loading })} type="submit" disabled={loading}>
      {loading ? 'Submitting...' : children}
    </button>
  )
}*/
import cn from 'classnames'
import css from './index.module.scss'
import { Link } from 'react-router-dom'

/*interface ButtonProps {
  children: React.ReactNode
  loading?: boolean
  variant?: 'blue' | 'white-with-blue-border' // Добавляем варианты для кнопки
}
*/
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
}