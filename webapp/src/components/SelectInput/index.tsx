import { FormikProps } from 'formik';
import cn from 'classnames';
import css from './index.module.scss';

export const SelectInput = ({
  name,
  label,
  formik,
  options,
  maxWidth,
}: {
  name: string;
  label: string;
  formik: FormikProps<any>;
  options: { value: string; label: string }[]; // Массив объектов с метками и значениями
  maxWidth?: number;
}) => {
  const value = formik.values[name];
  const error = formik.errors[name] as string | undefined;
  const touched = formik.touched[name];
  const invalid = !!touched && !!error;
  const disabled = formik.isSubmitting;

  return (
    <div className={cn(css.container, { [css.disabled]: disabled })} style={{ maxWidth }}>
      <div className={css.inputWrapper}>
        <label htmlFor={name} className={cn(css.label, { [css.invalid]: invalid })}>
          {label}
        </label>
        <select
          name={name}
          id={name}
          value={value}
          onChange={(e) => formik.setFieldValue(name, e.target.value)}
          onBlur={() => formik.setFieldTouched(name)}
          className={cn(css.input, { [css.invalid]: invalid })}
          disabled={disabled}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {invalid && <div className={css.error}>{error}</div>}
    </div>
  );
};
