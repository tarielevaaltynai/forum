import { FormikProps } from 'formik';
import cn from 'classnames';
import css from './index.module.scss';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import React, { forwardRef } from 'react';

export const DatePickerInput = ({
  name,
  label,
  formik,
  maxWidth,
}: {
  name: string;
  label: string;
  formik: FormikProps<any>;
  maxWidth?: number | string;
}) => {
  const value = formik.values[name] ? new Date(formik.values[name]) : null;
  const error = formik.errors[name] as string | undefined;
  const touched = formik.touched[name];
  const invalid = !!touched && !!error;
  const disabled = formik.isSubmitting;

  // Кастомный инпут с лейблом внутри
  // Custom input with label inside
  const CustomInput = forwardRef<
    HTMLInputElement,
    {
      value: string;
      onClick: () => void;
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    }
  >(({ value, onClick, onChange }, ref) => (
    <div className={css.inputWrapper}>
      <label className={css.label} htmlFor={name}>
        {label}
      </label>
      <input
        ref={ref}
        id={name}
        name={name}
        type="text"
        value={value}
        onClick={onClick}
        onChange={onChange}
        className={cn(css.input, { [css.invalid]: invalid })}
        disabled={disabled}
      />
    </div>
  ));

  return (
    <div
      className={cn(css.field, { [css.disabled]: disabled })}
      style={{ maxWidth }}
    >
      <DatePicker
        selected={value}
        onChange={(date) => formik.setFieldValue(name, date)}
        onBlur={() => formik.setFieldTouched(name)}
        customInput={
          <CustomInput
            value={value ? value.toISOString().split("T")[0] : ""}
            onClick={() => {}}
            onChange={(e) => formik.setFieldValue(name, e.target.value)}
          />
        }
        dateFormat="yyyy-MM-dd"
        disabled={disabled}
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
      />
      {invalid && <div className={css.error}>{error}</div>}
    </div>
  );
};

