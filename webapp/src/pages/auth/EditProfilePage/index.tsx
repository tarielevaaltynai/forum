
import type { TrpcRouterOutput } from "@forum_project/backend/src/router";
import { zUpdatePasswordTrpcInput } from "@forum_project/backend/src/router/auth/updatePassword/input";
import { zUpdateProfileTrpcInput } from "@forum_project/backend/src/router/auth/updateProfile/input";
import { zUpdateAvatarTrpcInput } from "@forum_project/backend/src/router/auth/updateAvatar/input";
import { Alert } from "../../../components/Alert";
import {
  zPasswordsMustBeTheSame,
  zStringRequired,
} from "@forum_project/shared/src/zod";
import { Button } from "../../../components/Button";
import { FormItems } from "../../../components/FormItems";
import { Input } from "../../../components/Input";
import { Segment } from "../../../components/Segment";
import { useForm } from "../../../lib/form";
import { withPageWrapper } from "../../../lib/pageWrapper";
import { trpc } from "../../../lib/trpc";
import { SelectInput } from "../../../components/SelectInput";
import { DatePickerInput } from "../../../components/DatePickerInput";
import styles from "./index.module.scss";
import avatar from "../../../assets/images/user.png";

import { UploadToCloudinary } from "../../../components/UploadToCloudinary";

const General = ({
  me,
}: {
  me: NonNullable<TrpcRouterOutput["getMe"]["me"]>;
}) => {
  const trpcUtils = trpc.useContext();
  const updateProfile = trpc.updateProfile.useMutation();
  const { formik, alertProps, buttonProps } = useForm({
    initialValues: {
      avatar: me.avatar,
      nick: me.nick,
      name: me.name,
      surname: me.surname,
      gender: me.gender,
      birthDate: me.birthDate,
    },
    validationSchema: zUpdateProfileTrpcInput,
    onSubmit: async (values) => {
      const updatedMe = await updateProfile.mutateAsync(values);
      trpcUtils.getMe.setData(undefined, { me: updatedMe });
    },
    successMessage: "Профиль обновлен",
    resetOnSuccess: false,
  });
  return (
    <form onSubmit={formik.handleSubmit}>
      <FormItems>
        <Input label="Ник" name="nick" formik={formik} />
        <Input label="Имя" name="name" formik={formik} />
        <Input label="Фамилия" name="surname" formik={formik} />

        <DatePickerInput
          label="Дата рождения"
          name="birthDate"
          formik={formik}
        />
        <SelectInput label="Пол" name="gender" formik={formik} />
        <Alert {...alertProps} />
        <Button {...buttonProps}>Сохранить</Button>
      </FormItems>
    </form>
  );
};

const Password = () => {
  const updatePassword = trpc.updatePassword.useMutation();
  const { formik, alertProps, buttonProps } = useForm({
    initialValues: {
      oldPassword: "",
      newPassword: "",
      newPasswordAgain: "",
    },
    validationSchema: zUpdatePasswordTrpcInput
      .extend({
        newPasswordAgain: zStringRequired,
      })
      .superRefine(zPasswordsMustBeTheSame("newPassword", "newPasswordAgain")),
    onSubmit: async ({ newPassword, oldPassword }) => {
      await updatePassword.mutateAsync({ newPassword, oldPassword });
    },
    successMessage: "Пароль изменен",
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <FormItems>
        <Input
          label="Старый пароль"
          name="oldPassword"
          type="password"
          formik={formik}
        />
        <Input
          label="Новый пароль"
          name="newPassword"
          type="password"
          formik={formik}
        />
        <Input
          label="Новый пароль"
          name="newPasswordAgain"
          type="password"
          formik={formik}
        />
        <Alert {...alertProps} />
        <Button {...buttonProps}>Изменить пароль</Button>
      </FormItems>
    </form>
  );
};

const Avatar = ({
  me,
}: {
  me: NonNullable<TrpcRouterOutput["getMe"]["me"]>;
}) => {
  const trpcUtils = trpc.useContext();
  const updateAvatar = trpc.updateAvatar.useMutation();
  const { formik, alertProps, buttonProps } = useForm({
    initialValues: {
      avatar: me.avatar,
    },
    validationSchema: zUpdateAvatarTrpcInput,
    onSubmit: async (values) => {


      const updatedMer = await updateAvatar.mutateAsync(values);
      trpcUtils.getMe.setData(undefined, { me: updatedMer });
    },
    successMessage: "Avatar обновлен",
    resetOnSuccess: false,
  });
  return (
    <form onSubmit={formik.handleSubmit}>
      <FormItems>

      <UploadToCloudinary
  label=""
  name="avatar"
  type="avatar"
  preset="big"
  formik={formik}
  defaultImage={avatar} // Передаем дефолтную картинку
/>
        <Alert {...alertProps} />
        <Button {...buttonProps}>Сохранить</Button>
      </FormItems>
    </form>
  );
};

export const EditProfilePage = withPageWrapper({
  authorizedOnly: true,
  setProps: ({ getAuthorizedMe }) => ({
    me: getAuthorizedMe(),
  }),
  title: "Edit Profile",
})(({ me }) => {
  return (
    <div className={styles.container}>
      {/* Левый блок с аватаркой и именем */}
      <div className={styles.profile}>
        <Avatar me={me} />
        <div className={styles.profileName}>
          <br />
          {me.name} <br /> {me.surname}
        </div>
      </div>

      {/* Правый блок с сегментами */}
      <div className={styles.segments}>
        <div className={styles.segment}>
          <Segment title="" size={2}>
            <h1 className={styles.pageTitle}>Профиль</h1>
            <General me={me} />
          </Segment>
        </div>
        <div className={styles.segment}>
          <Segment title="" size={2}>
            <h1 className={styles.pageTitle}>Пароль</h1>
            <Password />
          </Segment>
        </div>
      </div>
    </div>
  );
});
