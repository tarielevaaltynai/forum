import { z } from 'zod'
import { zStringRequired } from '@forum_project/shared/src/zod'
export const zUpdatePasswordTrpcInput = z.object({
  oldPassword: zStringRequired,
  newPassword: zStringRequired,
})