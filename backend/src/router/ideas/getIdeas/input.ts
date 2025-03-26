import { z } from 'zod'

import { zStringOptional } from '@forum_project/shared/src/zod'
export const zGetIdeasTrpcInput = z.object({
  cursor: z.coerce.number().optional(),
  limit: z.number().min(1).max(100).default(10),
  search: zStringOptional,

})