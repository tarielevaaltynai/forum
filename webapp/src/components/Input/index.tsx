/*import cn from 'classnames'
import { type FormikProps } from 'formik'
import css from './index.module.scss'

export const Input = ({
    name,
    label,
    formik,
    maxWidth,
    type = 'text',
  }: {
    name: string
    label: string
    formik: FormikProps<any>
    maxWidth?: number
    type?: 'text' | 'password'
  }) => {
  const value = formik.values[name]
  const error = formik.errors[name] as string | undefined
  const touched = formik.touched[name]
  const invalid = !!touched && !!error
  const disabled = formik.isSubmitting


    return (
        <div className={cn({ [css.field]: true, [css.disabled]: disabled })}>
        <label className={css.label} htmlFor={name}>
          {label}
        </label>
        <input
                className={cn({
                    [css.input]: true,
                    [css.invalid]: invalid,
                  })}
                  style={{ maxWidth }}
          type={type}
          onChange={(e) => {
            void formik.setFieldValue(name, e.target.value)
          }}
          onBlur={() => {
            void formik.setFieldTouched(name)
          }}


          value={value}
          name={name}
          id={name}
          disabled={formik.isSubmitting}
        />
        {invalid && <div className={css.error}>{error}</div>}
      </div>
    )
  }*/
    import { FormikProps } from 'formik';
    import cn from 'classnames';
    import css from './index.module.scss';
    
    export const Input = ({
      name,
      label,
      formik,
      maxWidth,
      type = 'text',
    }: {
      name: string;
      label: string;
      formik: FormikProps<any>;
      maxWidth?: number | string;
      type?: 'text' | 'password';
    }) => {
      const value = formik.values[name];
      const error = formik.errors[name] as string | undefined;
      const touched = formik.touched[name];
      const invalid = !!touched && !!error;
      const disabled = formik.isSubmitting;
    
      return (
        <div className={cn(css.container, { [css.disabled]: disabled })} style={{ maxWidth }}>
          <div className={css.inputWrapper}>
            <label htmlFor={name} className={css.label}>
              {label}
            </label>
            <input
              className={cn(css.input, { [css.invalid]: invalid })}
              type={type}
              onChange={(e) => formik.setFieldValue(name, e.target.value)}
              onBlur={() => formik.setFieldTouched(name)}
              value={value}
              name={name}
              id={name}
              disabled={disabled}
            />
          </div>
          {invalid && <div className={css.error}>{error}</div>}
        </div>
      );
    };
    
    