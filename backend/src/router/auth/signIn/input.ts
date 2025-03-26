import { z } from 'zod'
import { zStringRequired } from '@forum_project/shared/src/zod'
export const zSignInTrpcInput = z.object({
  nick: zStringRequired,
  password: zStringRequired,

})