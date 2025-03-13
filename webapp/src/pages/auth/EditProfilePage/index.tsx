/*import type { TrpcRouterOutput } from '@forum_project/backend/src/router'
import { zUpdatePasswordTrpcInput } from '@forum_project/backend/src/router/auth/updatePassword/input'
import { zUpdateProfileTrpcInput } from '@forum_project/backend/src/router/auth/updateProfile/input'
import { Alert } from '../../../components/Alert'
import { z } from 'zod'
import { Button } from '../../../components/Button'
import { FormItems } from '../../../components/FormItems'
import { Input } from '../../../components/Input'
import { Segment } from '../../../components/Segment'
import { useForm } from '../../../lib/form'
import { withPageWrapper } from '../../../lib/pageWrapper'
import { trpc } from '../../../lib/trpc'
import { SelectInput } from '../../../components/SelectInput'
import { DatePickerInput } from '../../../components/DatePickerInput'

const General = ({ me }: { me: NonNullable<TrpcRouterOutput['getMe']['me']> }) => {
  const trpcUtils = trpc.useContext()
  const updateProfile = trpc.updateProfile.useMutation()
  const { formik, alertProps, buttonProps } = useForm({
    initialValues: {
      nick: me.nick,
      name: me.name,
      surname:me.surname,
      gender:me.gender,
      birthDate:me.birthDate,
    },
    validationSchema: zUpdateProfileTrpcInput,
    onSubmit: async (values) => {
      const updatedMe = await updateProfile.mutateAsync(values)
      trpcUtils.getMe.setData(undefined, { me: updatedMe })
    },
    successMessage: 'Profile updated',
    resetOnSuccess: false,
  })
  return (
    <form onSubmit={formik.handleSubmit}>
      <FormItems>
<Input label="Nick" name="nick" formik={formik} />
              <Input label="Имя" name="name" formik={formik} />
              <Input label="Фамилия" name="surname" formik={formik} />
              <DatePickerInput label="birtate" name="birthDate" formik={formik} />
              <SelectInput label="gender" name="gender" formik={formik} />
        <Alert {...alertProps} />
        <Button {...buttonProps}>Сохранить</Button>
      </FormItems>
    </form>
  )
}

const Password = () => {
  const updatePassword = trpc.updatePassword.useMutation()
  const { formik, alertProps, buttonProps } = useForm({
    initialValues: {
      oldPassword: '',
      newPassword: '',
      newPasswordAgain: '',
    },
    validationSchema: zUpdatePasswordTrpcInput
      .extend({
        newPasswordAgain: z.string().min(1),
      })
      .superRefine((val, ctx) => {
        if (val.newPassword !== val.newPasswordAgain) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Пароли должны совпадать',
            path: ['newPasswordAgain'],
          })
        }
      }),
    onSubmit: async ({ newPassword, oldPassword }) => {
      await updatePassword.mutateAsync({ newPassword, oldPassword })
    },
    successMessage: 'Password updated',
  })

  return (
    <form onSubmit={formik.handleSubmit}>
      <FormItems>
        <Input label="Old password" name="oldPassword" type="password" formik={formik} />
        <Input label="New password" name="newPassword" type="password" formik={formik} />
        <Input label="New password again" name="newPasswordAgain" type="password" formik={formik} />
        <Alert {...alertProps} />
        <Button {...buttonProps}>Update Password</Button>
      </FormItems>
    </form>
  )
}

export const EditProfilePage = withPageWrapper({
  authorizedOnly: true,
  setProps: ({ getAuthorizedMe }) => ({
    me: getAuthorizedMe(),
  }),
})(({ me }) => {
  return (
    <div>
      <Segment title="General" size={2}>
        <General me={me} />
      </Segment>
      <Segment title="Password" size={2}>
        <Password />
      </Segment>
    </div>
  )
})*/
import type { TrpcRouterOutput } from '@forum_project/backend/src/router'
import { zUpdatePasswordTrpcInput } from '@forum_project/backend/src/router/auth/updatePassword/input'
import { zUpdateProfileTrpcInput } from '@forum_project/backend/src/router/auth/updateProfile/input'
import { Alert } from '../../../components/Alert'
import { z } from 'zod'
import { Button } from '../../../components/Button'
import { FormItems } from '../../../components/FormItems'
import { Input } from '../../../components/Input'
import { Segment } from '../../../components/Segment'
import { useForm } from '../../../lib/form'
import { withPageWrapper } from '../../../lib/pageWrapper'
import { trpc } from '../../../lib/trpc'
import { SelectInput } from '../../../components/SelectInput'
import { DatePickerInput } from '../../../components/DatePickerInput'
import styles from './index.module.scss'
import avatar from '../../../assets/images/user.png'
const General = ({ me }: { me: NonNullable<TrpcRouterOutput['getMe']['me']> }) => {
  const trpcUtils = trpc.useContext()
  const updateProfile = trpc.updateProfile.useMutation()
  const { formik, alertProps, buttonProps } = useForm({
    initialValues: {
      nick: me.nick,
      name: me.name,
      surname: me.surname,
      gender: me.gender,
      birthDate: me.birthDate,
    },
    validationSchema: zUpdateProfileTrpcInput,
    onSubmit: async (values) => {
      const updatedMe = await updateProfile.mutateAsync(values)
      trpcUtils.getMe.setData(undefined, { me: updatedMe })
    },
    successMessage: 'Профиль обновлен',
    resetOnSuccess: false,
  })
  return (
    <form onSubmit={formik.handleSubmit}>
      <FormItems>
        <Input label="Ник" name="nick" formik={formik} />
        <Input label="Имя" name="name" formik={formik} />
        <Input label="Фамилия" name="surname" formik={formik} />
        <DatePickerInput label="Дата рождения" name="birthDate" formik={formik} />
        <SelectInput label="Пол" name="gender" formik={formik} />
        <Alert {...alertProps} />
        <Button {...buttonProps}>Сохранить</Button>
      </FormItems>
    </form>
  )
}

const Password = () => {
  const updatePassword = trpc.updatePassword.useMutation()
  const { formik, alertProps, buttonProps } = useForm({
    initialValues: {
      oldPassword: '',
      newPassword: '',
      newPasswordAgain: '',
    },
    validationSchema: zUpdatePasswordTrpcInput
      .extend({
        newPasswordAgain: z.string().min(1),
      })
      .superRefine((val, ctx) => {
        if (val.newPassword !== val.newPasswordAgain) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Пароли должны совпадать',
            path: ['newPasswordAgain'],
          })
        }
      }),
    onSubmit: async ({ newPassword, oldPassword }) => {
      await updatePassword.mutateAsync({ newPassword, oldPassword })
    },
    successMessage: 'Пароль изменен',
  })

  return (
    <form onSubmit={formik.handleSubmit}>
      <FormItems>
        <Input label="Старый пароль" name="oldPassword" type="password" formik={formik} />
        <Input label="Новый пароль" name="newPassword" type="password" formik={formik} />
        <Input label="Новый пароль" name="newPasswordAgain" type="password" formik={formik} />
        <Alert {...alertProps} />
        <Button {...buttonProps}>Изменить пароль</Button>
      </FormItems>
    </form>
  )
}

export const EditProfilePage = withPageWrapper({
  authorizedOnly: true,
  setProps: ({ getAuthorizedMe }) => ({
    me: getAuthorizedMe(),
  }),
})(({ me }) => {

      return (
    <div className={styles.container}>
      {/* Левый блок с аватаркой и именем */}
      <div className={styles.profile}>
        <img alt="Profile picture" height="150" src={avatar} width="150" />
        <div className={styles.profileName}>{me.name}  <br /> {me.surname}</div>
      </div>

      {/* Правый блок с сегментами */}
      <div className={styles.segments}>
        <div className={styles.segment}>
          <Segment title="Профиль" size={2}>
            <General me={me} />
          </Segment>
        </div>
        <div className={styles.segment}>
          <Segment title="Пароль" size={2}>
            <Password />
          </Segment>
        </div>
      </div>
    </div>
  );
})
