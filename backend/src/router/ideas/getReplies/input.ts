import { z } from 'zod'

export const zGetRepliesTrpcInput = z.object({
  parentId: z.string().uuid(), // ID родительского комментария
  limit: z.number().min(1).max(100).default(10), // Ограничение на количество
  cursor: z.string().uuid().optional() // Для пагинации
})
