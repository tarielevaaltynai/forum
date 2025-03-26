import { z } from 'zod'
import { zStringRequired } from '@forum_project/shared/src/zod'
export const zSetIdeaLikeIdeaTrpcInput = z.object({
  ideaId: zStringRequired,
  isLikedByMe: z.boolean(),
})