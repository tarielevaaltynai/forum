import { z } from 'zod'

export const zSignUpTrpcInput = z.object({
  nick: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'Ник может содержать только строчные буквы, цифры и дефисы.'),
  password: z.string().min(1),
  surname:z.string().min(1),
  name:z.string().min(1),
  email: z.string().min(1).email(),
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
  
});
  
