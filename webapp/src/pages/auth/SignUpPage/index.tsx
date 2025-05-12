
import { zSignUpTrpcInput } from "@forum_project/backend/src/router/auth/signUp/input";
import { z } from "zod";
import Cookies from "js-cookie";
import { useForm } from "../../../lib/form";
import { Alert } from "../../../components/Alert";
import { Button } from "../../../components/Button";
import { FormItems } from "../../../components/FormItems";
import { Input } from "../../../components/Input";
import { Segment } from "../../../components/Segment";
import { trpc } from "../../../lib/trpc";
import { withPageWrapper } from "../../../lib/pageWrapper";
import css from "./index.module.scss";
import { DatePickerInput } from "../../../components/DatePickerInput";
import { SelectInput } from "../../../components/SelectInput";
import { useMemo } from "react";

import { UploadToS3 } from '../../../components/UploadToS3'

// Функция для валидации совпадения пароля и подтверждения пароля
const zPasswordsMustBeTheSame = (passwordField: string, confirmPasswordField: string) => {

  return (data: any) => {
    if (data[passwordField] !== data[confirmPasswordField]) {
      return {
        [confirmPasswordField]: "Пароли не совпадают",
      };
    }
  };
};

export const SignUpPage = withPageWrapper({
  redirectAuthorized: true,
  title: "Sign Up",
})(() => {
  const trpcUtils = trpc.useContext();
  const signUp = trpc.signUp.useMutation();

  const genderOptions = [
    { value: "MALE", label: "Мужской" },
    { value: "FEMALE", label: "Женский" },
    { value: "OTHER", label: "Другой" },
  ];
  

  const roleOptions = [
    { value: "USER", label: "Обычный пользователь" },
    { value: "EXPERT", label: "Специалист" },
  ];

  const { formik, buttonProps, alertProps } = useForm({
    initialValues: {
      nick: "",
      password: "",
      passwordAgain: "",
      email: "",
      birthDate: "",
      surname: "",
      name: "",
      gender: "MALE",
      role: "USER", // по умолчанию
      specialty: "",
      document: "",
    },
    validationSchema: z.object({
      ...zSignUpTrpcInput.shape, // Вставляем существующие поля из zSignUpTrpcInput
      passwordAgain: z.string().min(1, "Повторите пароль"), // Добавляем новое поле для повторного пароля
    }).superRefine(zPasswordsMustBeTheSame("password", "passwordAgain")),

    onSubmit: async (values) => {
      const { token } = await signUp.mutateAsync(values);
      Cookies.set("token", token, { expires: 99999 });
      void trpcUtils.invalidate();
    },
    resetOnSuccess: false,
  });

  const isExpert = useMemo(() => formik.values.role === "EXPERT", [formik.values.role]);


  return (
    <div className={css.container}>
      <main
        className="sign-up-page"
        style={{ display: "flex", height: "100vh" }}
      >
        <section className="signup-form" style={{ flex: 1, padding: "2rem" }}>
          <Segment title="">
            <h2 className={css.pageTitle}>Добро пожаловать!</h2>
            <h2 className={css.pageTitle}>Присоединяйтесь к нам!</h2>
            <p className={css.pageTitle}>
              Создайте аккаунт и начните делиться своими знаниями и идеями!
            </p>
            <form onSubmit={formik.handleSubmit}>
              <FormItems>
                <Input label="Ник" name="nick" formik={formik} />
                <Input label="Имя" name="name" formik={formik} />
                <Input label="Фамилия" name="surname" formik={formik} />
                <Input label="E-mail" name="email" formik={formik} />
                <Input
                  label="Пароль"
                  name="password"
                  type="password"
                  formik={formik}
                />
                <Input
                  label="Повторите пароль"
                  name="passwordAgain"
                  type="password"
                  formik={formik}
                />
                <DatePickerInput
                  label="Дата рождения"
                  name="birthDate"
                  formik={formik}
                />
                <SelectInput
                  options={genderOptions}
                  label="Пол"
                  name="gender"
                  formik={formik}
                />
                <SelectInput
                  options={roleOptions}
                  label="Роль"
                  name="role"
                  formik={formik}
                />

                {isExpert && (
                  <>
                    <Input
                      label="Специальность"
                      name="specialty"
                      formik={formik}
                    />
                    <UploadToS3
                      label="Документ"
                      name="document"
                      formik={formik}
                    />
                  </>
                )}

                <Alert {...alertProps} />
                <Button {...buttonProps}>Зарегистрироваться</Button>
              </FormItems>
            </form>
          </Segment>
        </section>
      </main>
    </div>
  );
});
