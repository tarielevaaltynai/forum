<<<<<<< HEAD
<<<<<<< HEAD
=======

>>>>>>> fb062d1a24c27a29d9bebb5197bfdce88d7c645c
import * as dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()
<<<<<<< HEAD
const zNonemptyTrimmed = z.string().trim().min(1)
const zNonemptyTrimmedRequiredOnNotLocal = zNonemptyTrimmed.optional().refine(
  // eslint-disable-next-line node/no-process-env
  (val) => process.env.HOST_ENV === 'local' || !!val,
  'Required on local host'
)

=======

// const zEnv = z.object({
//   PORT: z.string().trim().min(1),
//   DATABASE_URL: z.string().trim().min(1),
//   JWT_SECRET: z.string().trim().min(1),
//   PASSWORD_SALT: z.string().trim().min(1),
//   INITIAL_ADMIN_PASSWORD: z.string().trim().min(1),
// })
>>>>>>> fb062d1a24c27a29d9bebb5197bfdce88d7c645c

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
<<<<<<< HEAD

// eslint-disable-next-line node/no-process-env
export const env = zEnv.parse(process.env)
=======
import * as dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const zEnv = z.object({
  PORT: z.string().trim().min(1),
  DATABASE_URL: z.string().trim().min(1),
  JWT_SECRET: z.string().trim().min(1),
  PASSWORD_SALT: z.string().trim().min(1),
  INITIAL_ADMIN_PASSWORD: z.string().trim().min(1),
});

// eslint-disable-next-line node/no-process-env
export const env = zEnv.parse(process.env);
>>>>>>> d7d1fffabf09f567df420b0e3df5ed632c29940c
=======
// eslint-disable-next-line node/no-process-env
export const env = zEnv.parse(process.env)
>>>>>>> fb062d1a24c27a29d9bebb5197bfdce88d7c645c
