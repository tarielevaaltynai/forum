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
/*
export const SignUpPage = () => {
  const navigate = useNavigate()
  const trpcUtils = trpc.useContext()
  const [submittingError, setSubmittingError] = useState<string | null>(null)
  const signUp = trpc.signUp.useMutation()
  const formik = useFormik({
    initialValues: {
      nick: '',
      password: '',
      passwordAgain: '',
    },
    validate: withZodSchema(
      zSignUpTrpcInput
        .extend({
          passwordAgain: z.string().min(1),
        })
        .superRefine((val, ctx) => {
          if (val.password !== val.passwordAgain) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Passwords must be the same',
              path: ['passwordAgain'],
            })
          }
        })
    ),
    onSubmit: async (values) => {
      try {
        setSubmittingError(null)
        const { token } = await signUp.mutateAsync(values)
        Cookies.set('token', token, { expires: 99999 })
        void trpcUtils.invalidate()
        navigate(getAllIdeasRoute())
      } catch (err: any) {
        setSubmittingError(err.message)
      }
    },
  })

  return (
    <Segment title="Sign Up">
      <form onSubmit={formik.handleSubmit}>
        <FormItems>
          <Input label="Nick" name="nick" formik={formik} />
          <Input label="Password" name="password" type="password" formik={formik} />
          <Input label="Password again" name="passwordAgain" type="password" formik={formik} />
          {!formik.isValid && !!formik.submitCount && <Alert color="red">Some fields are invalid</Alert>}
          {submittingError && <Alert color="red">{submittingError}</Alert>}
          <Button loading={formik.isSubmitting}>Sign Up</Button>
        </FormItems>
      </form>
    </Segment>
  )
}
  */
export const SignUpPage = withPageWrapper({
  redirectAuthorized: true,
})(() => {
  const trpcUtils = trpc.useContext();
  const signUp = trpc.signUp.useMutation();
  const options = [
    { value: "Мужской", label: "Мужской" },
    { value: "Женский", label: "Женский" },
    { value: "Другой", label: "Другой" },
  ];

  const { formik, buttonProps, alertProps } = useForm({
    initialValues: {
      nick: "",
      password: "",
      passwordAgain: "",
      birthDate: "",
      surname: "",
      name: "",
      gender: "",
    },
    validationSchema: zSignUpTrpcInput
      .extend({
        passwordAgain: z.string().min(1),
      })
      .superRefine((val, ctx) => {
        if (val.password !== val.passwordAgain) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Passwords must be the same",
            path: ["passwordAgain"],
          });
        }
      }),

    onSubmit: async (values) => {
      const { token } = await signUp.mutateAsync(values);
      Cookies.set("token", token, { expires: 99999 });
      void trpcUtils.invalidate();
    },
    resetOnSuccess: false,
  });

  return (
    <main className="sign-up-page" style={{ display: "flex", height: "100vh" }}>
      <section className="signup-form" style={{ flex: 1, padding: "2rem" }}>
        <Segment title="Добро пожаловать!">
          <h2 className="text-3xl font-bold mb-4">Присоединяйтесь к нам!</h2>
          <p className="mb-6">
            Создайте аккаунт и начните делиться своими знаниями и идеями!
          </p>
          <form onSubmit={formik.handleSubmit}>
            <FormItems>
              <Input label="Ник" name="nick" formik={formik} />
              <Input label="Имя" name="name" formik={formik} />
              <Input label="Фамилия" name="surname" formik={formik} />
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
                options={options}
                label="Пол"
                name="gender"
                formik={formik}
              />

              <Alert {...alertProps} />
              <Button {...buttonProps}>Зарегистрироваться</Button>
            </FormItems>
          </form>
        </Segment>
      </section>
      <section className="image-container" style={{ flex: 1 }}>
        <img
          src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg9kIwqQI4Wm__s70LeqFj4guuBuQuIl9IYWj-TRFFSyoSIkuvNUx6iB6rMhi-L_gfYGCT_tNUGhj_M4WfujL-wvt7dv9NjESoJmRis_6b8wbeuULO1fh-_sL6ADzkSpWtPBY5ISaZwORk/s1440/6f7fd0cb-2293-4fa5-942e-991c1eb3bedb.jpg"
          alt="Beauty & Health"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </section>
    </main>
  );
});
