import * as dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

// const zEnv = z.object({
//   PORT: z.string().trim().min(1),
//   DATABASE_URL: z.string().trim().min(1),
//   JWT_SECRET: z.string().trim().min(1),
//   PASSWORD_SALT: z.string().trim().min(1),
//   INITIAL_ADMIN_PASSWORD: z.string().trim().min(1),
// })

const zEnv = z.object({
  PORT: zNonemptyTrimmed,
  HOST_ENV: z.enum(['local', 'production']),
  DATABASE_URL: zNonemptyTrimmed,
  JWT_SECRET: zNonemptyTrimmed,
  PASSWORD_SALT: zNonemptyTrimmed,
  INITIAL_ADMIN_PASSWORD: zNonemptyTrimmed,
  WEBAPP_URL: zNonemptyTrimmed,
  BREVO_API_KEY: zNonemptyTrimmedRequiredOnNotLocal,
  FROM_EMAIL_NAME: zNonemptyTrimmed,
  FROM_EMAIL_ADDRESS: zNonemptyTrimmed,
})
// eslint-disable-next-line node/no-process-env
export const env = zEnv.parse(process.env)