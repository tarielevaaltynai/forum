import { z } from 'zod'

export const zUpdateProfileTrpcInput = z.object({
  nick: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'Nick may contain only lowercase letters, numbers and dashes'),
  name: z.string().max(50).default(''),
  surname: z.string().max(50).default(''),
  gender:z.string().min(1),
  birthDate: z
  .coerce.date() // Преобразует строку в дату
  .refine((date) => {
    const minAge = 6;
    const today = new Date();
    const birthDateLimit = new Date(
      today.getFullYear() - minAge,
      today.getMonth(),
      today.getDate()
    );
    return date <= birthDateLimit;
  }, 'Вам должно быть не менее 6 лет.'),

})