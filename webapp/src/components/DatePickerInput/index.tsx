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
  maxWidth?: number;
}) => {
  const value = formik.values[name] ? new Date(formik.values[name]) : null;
  const error = formik.errors[name] as string | undefined;
  const touched = formik.touched[name];
  const invalid = !!touched && !!error;
  const disabled = formik.isSubmitting;

  // Кастомный инпут с лейблом внутри
  const CustomInput = forwardRef<HTMLInputElement, { value: string; onClick: () => void; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }>(
    ({ value, onClick, onChange }, ref) => (
      <div className={css.inputWrapper}>
        <label className={cn(css.label, { [css.invalid]: invalid })}>{label}</label>
        <input
          ref={ref} // Pass the ref here
          type="text"
          value={value}
          onClick={onClick} // Важно, чтобы при клике открывался календарь
          onChange={onChange} // Handle onChange to update the value
          className={cn(css.input, { [css.invalid]: invalid })}
        />
      </div>
    )
  );

  return (
    <div className={cn(css.container, { [css.disabled]: disabled })} style={{ maxWidth }}>
      <DatePicker
        selected={value}
        onChange={(date) => formik.setFieldValue(name, date)} // Formik onChange handler
        onBlur={() => formik.setFieldTouched(name)}
        customInput={<CustomInput value={formik.values[name]} onClick={() => {}} onChange={(e) => formik.setFieldValue(name, e.target.value)} />}
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

