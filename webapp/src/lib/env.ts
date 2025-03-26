import { zEnvNonemptyTrimmed } from '@forum_project/shared/src/zod'
import { z } from "zod";
export const zEnv = z.object({
  VITE_BACKEND_TRPC_URL: zEnvNonemptyTrimmed,
  VITE_WEBAPP_URL: zEnvNonemptyTrimmed,
})

// eslint-disable-next-line node/no-process-env
export const env = zEnv.parse(process.env)
const school: string = "scgend";
