import { trpcLoggedProcedure } from '../../../lib/trpc'
import { z } from 'zod'

export const zGetCommentsTrpcInput = z.object({
  ideaId: z.string().uuid(),
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().uuid().optional() // для пагинации
})
