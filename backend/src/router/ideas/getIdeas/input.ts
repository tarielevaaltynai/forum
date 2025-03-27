 import { z } from 'zod'

// import { zStringOptional } from '@forum_project/shared/src/zod'
// export const zGetIdeasTrpcInput = z.object({
//   cursor: z.coerce.number().optional(),
//   limit: z.number().min(1).max(100).default(10),
//   search: zStringOptional,

// })

// backend/src/router/ideas/getIdeas/input.ts
// import { z } from 'zod'

// export const zGetIdeasTrpcInput = z.object({
//   cursor: z.coerce.number().optional(),
//   limit: z.number().min(1).max(100).default(10),
//   search: z.string().optional(),
//   searchMode: z.enum(['simple', 'advanced']).default('simple'), // Добавлено
//   searchFields: z.array(z.enum(['name', 'description', 'text'])).default(['name', 'description', 'text']) // Добавлено
// })


export const zGetIdeasTrpcInput = z.object({
  search: z.string().trim().optional(),
  cursor: z.coerce.number().optional(),
  limit: z.number().min(1).max(100).default(10)
});