import { z } from 'zod'




export const zGetIdeasTrpcInput = z.object({
  search: z.string().trim().optional(),
  cursor: z.coerce.number().optional(),
  limit: z.number().min(1).max(100).default(10)
});