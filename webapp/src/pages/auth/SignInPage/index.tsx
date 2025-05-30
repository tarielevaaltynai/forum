import { zSignInTrpcInput } from "@forum_project/backend/src/router/auth/signIn/input";
import { useForm } from "../../../lib/form";
import { Alert } from "../../../components/Alert";
import { Button } from "../../../components/Button";
import { FormItems } from "../../../components/FormItems";
import { Input } from "../../../components/Input";
import { Segment } from "../../../components/Segment";
import { trpc } from "../../../lib/trpc";
import Cookies from "js-cookie";
import { withPageWrapper } from "../../../lib/pageWrapper";
import css from "./index.module.scss";
/*
export const SignInPage = () => {
  
  const navigate = useNavigate()
  const trpcUtils = trpc.useContext()
  const [submittingError, setSubmittingError] = useState<string | null>(null)
  const signIn = trpc.signIn.useMutation()
  const formik = useFormik({
    initialValues: {
      nick: '',
      password: '',
    },
    validate: withZodSchema(zSignInTrpcInput),
    onSubmit: async (values) => {
      try {
        setSubmittingError(null)
        const { token } = await signIn.mutateAsync(values)
        Cookies.set('token', token, { expires: 99999 })
        void trpcUtils.invalidate()
        navigate(getAllIdeasRoute())
      } catch (err: any) {
        setSubmittingError(err.message)
      }
    },
  })

  return (
    <Segment title="Sign In">
      <form onSubmit={formik.handleSubmit}>
        <FormItems>
          <Input label="Nick" name="nick" formik={formik} />
          <Input label="Password" name="password" type="password" formik={formik} />
          {!formik.isValid && !!formik.submitCount && <Alert color="red">Some fields are invalid</Alert>}
          {submittingError && <Alert color="red">{submittingError}</Alert>}
          <Button loading={formik.isSubmitting}>Sign In</Button>
        </FormItems>
      </form>
    </Segment>
  )
}*/

export const SignInPage = withPageWrapper({
  redirectAuthorized: true,
  title: "Sign In",
})(() => {
  const trpcUtils = trpc.useContext();
  const signIn = trpc.signIn.useMutation();

  const { formik, buttonProps, alertProps } = useForm({
    initialValues: {
      nick: "",
      password: "",
    },
    validationSchema: zSignInTrpcInput,
    onSubmit: async (values) => {
      const { token } = await signIn.mutateAsync(values);
      Cookies.set("token", token, { expires: 99999 });
      void trpcUtils.invalidate();
    },
    resetOnSuccess: false,
  });

  return (
    <div className={css.container}>
      <main
        className="sign-in-page"
        style={{ display: "flex", height: "100vh" }}
      >
        <section className="login-form" style={{ flex: 1, padding: "2rem" }}>
          <Segment title="">
            <h2 className={css.pageTitle}>Добро пожаловать!</h2>
            <h2 className={css.pageTitle}>
              Ваша красота и здоровье — ваш голос!
            </h2>
            <h2 className={css.pageTitle}>
              Присоединяйтесь к обсуждению и делитесь своими знаниями!
            </h2>
            <form onSubmit={formik.handleSubmit}>
              <FormItems>
                <Input label="Имя пользователя" name="nick" formik={formik} />
                <Input
                  label="Пароль"
                  name="password"
                  type="password"
                  formik={formik}
                />
                <Alert {...alertProps} />
                <Button {...buttonProps}>Войти</Button>
              </FormItems>
            </form>
          </Segment>
        </section>
        {/* <section className="image-container" style={{ flex: 1 }}>
          <img
            src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg9kIwqQI4Wm__s70LeqFj4guuBuQuIl9IYWj-TRFFSyoSIkuvNUx6iB6rMhi-L_gfYGCT_tNUGhj_M4WfujL-wvt7dv9NjESoJmRis_6b8wbeuULO1fh-_sL6ADzkSpWtPBY5ISaZwORk/s1440/6f7fd0cb-2293-4fa5-942e-991c1eb3bedb.jpg"
            alt="Beauty & Health"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </section> */}
      </main>
    </div>
  );
});
