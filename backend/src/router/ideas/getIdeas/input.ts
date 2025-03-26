<<<<<<< HEAD
import { z } from 'zod'

export const zGetIdeasTrpcInput = z.object({
  cursor: z.coerce.number().optional(),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
=======
import { z } from 'zod'

export const zGetIdeasTrpcInput = z.object({
  cursor: z.coerce.number().optional(),
  limit: z.number().min(1).max(100).default(10),
>>>>>>> d7d1fffabf09f567df420b0e3df5ed632c29940c
})