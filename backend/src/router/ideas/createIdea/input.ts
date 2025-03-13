import { z } from 'zod'

export const zCreateIdeaTrpcInput = z.object({
  name: z.string().min(1),
  nick: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'Ник может содержать только строчные буквы, цифры и дефисы.'),
  description: z.string().min(1,'Текст должен быть не короче 1 символа.'),
  text: z.string().min(100, 'Текст должен быть не короче 100 символов.'),
})