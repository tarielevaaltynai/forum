import { z } from 'zod'

export const zEnvNonemptyTrimmed = z.string().trim().min(1)
export const zEnvNonemptyTrimmedRequiredOnNotLocal = zEnvNonemptyTrimmed.optional().refine(
  // eslint-disable-next-line node/no-process-env
  (val) => `${process.env.HOST_ENV}` === 'local' || !!val,
  'Required on not local host'
)
export const zEnvHost = z.enum(['local', 'production'])

export const zStringRequired = z.string({ required_error: 'Пожалуйста заполни поле' }).min(1, 'Пожалуйста заполни поле')
export const zStringOptional = z.string().optional()
export const zEmailRequired = zStringRequired.email()
export const zNickRequired = zStringRequired.regex(
  /^[a-z0-9-]+$/,
  'Ник может содержать только строчные буквы, цифры и тире.'
)
export const zStringMin = (min: number) => zStringRequired.min(min, `Длина текста должна быть хотя бы ${min} символов`)
export const zPasswordsMustBeTheSame =
  (passwordFieldName: string, passwordAgainFieldName: string) => (val: any, ctx: z.RefinementCtx) => {
    if (val[passwordFieldName] !== val[passwordAgainFieldName]) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Пароль должен совпадать',
        path: [passwordAgainFieldName],
      })
    }
  }