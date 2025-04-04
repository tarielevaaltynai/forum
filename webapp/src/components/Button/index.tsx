import css from "./index.module.scss";
import cn from "classnames";
import { Link } from "react-router-dom";

type ButtonColor = "red" | "green";
export type ButtonProps = {
  children: React.ReactNode;
  loading?: boolean;
  color?: ButtonColor;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
};
export const Button = ({
  children,
  loading = false,
  color = "blue",
  type = "submit",
  disabled,
  onClick,
}: ButtonProps) => {
  return (
    <button
      className={cn({
        [css.button]: true,
        [css[`color-${color}`]]: true,
        [css.disabled]: disabled || loading,
        [css.loading]: loading,
      })}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
    >
      <span className={css.text}>{children}</span>
    </button>
  );
};
export const LinkButton = ({
  children,
  to,
  color = "blue",
}: {
  children: React.ReactNode;
  to: string;
  color?: ButtonColor;
}) => {
  return (
    <Link
      className={cn({ [css.button]: true, [css[`color-${color}`]]: true })}
      to={to}
    >
      {children}
    </Link>
  );
};
export const Buttons = ({ children }: { children: React.ReactNode }) => {
  return <div className={css.buttons}>{children}</div>;
};
/*
import cn from 'classnames'
import css from './index.module.scss'
import { Link } from 'react-router-dom'
>>>>>>> 5d5d37abc739fc07872d9333ef68026e0af37796

type ButtonColor = "red" | "green" | "blue" | "white-with-blue-border";
export type ButtonProps = {
  children: React.ReactNode;
  loading?: boolean;
  color?: ButtonColor;
};
export const Button = ({
  children,
  loading = false,
  color = "blue",
}: ButtonProps) => {
  return (
    <button
      className={cn({
        [css.button]: true,
        [css[`color-${color}`]]: true,
        [css.disabled]: loading,
        [css.loading]: loading,
      })}
      type="submit"
      disabled={loading}
    >
      <span className={css.text}>{children}</span>
    </button>
  );
};
export const LinkButton = ({
  children,
  to,
  color = "blue",
}: {
  children: React.ReactNode;
  to: string;
  color?: ButtonColor;
}) => {
  return (
    <Link
      className={cn({ [css.button]: true, [css[`color-${color}`]]: true })}
      to={to}
    >
      {children}
    </Link>
  )

}

export const Buttons = ({ children }: { children: React.ReactNode }) => {
  return <div className={css.buttons}>{children}</div>
}

import { Link } from 'react-router-dom'
import cn from 'classnames'
import css from './index.module.scss'

type ButtonColor = 'red' | 'green' | 'blue' | 'white-with-blue-border'

export type ButtonProps = {
  children: React.ReactNode
  loading?: boolean
  color?: ButtonColor
  type?: 'button' | 'submit'
  disabled?: boolean
  onClick?: () => void
}

export const Button = ({
  children,
  loading = false,
  color = 'green',
  type = 'button',
  disabled,
  onClick,
}: ButtonProps) => {
  return (
    <button
      className={cn(css.button, css[`color-${color}`], {
        [css.disabled]: disabled || loading,
        [css.loading]: loading,
      })}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
    >
      <span className={css.text}>{children}</span>
    </button>
  )
}

// ✅ Добавляем LinkButton
export const LinkButton = ({
  children,
  to,
  color = 'blue',
}: {
  children: React.ReactNode
  to: string
  color?: ButtonColor
}) => {
  return (
    <Link className={cn(css.button, css[`color-${color}`])} to={to}>
      {children}
    </Link>
  )
}

export const Buttons = ({ children }: { children: React.ReactNode }) => {
  return <div className={css.buttons}>{children}</div>
}
*/
