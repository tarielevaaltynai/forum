
import { z } from "zod";
import { zEmailRequired, zNickRequired, zStringRequired } from '@forum_project/shared/src/zod'
export const zSignUpTrpcInput = z.object({
  nick: zNickRequired,
  email: zEmailRequired,
  password: zStringRequired,
  surname: z.string().min(1),
  name: z.string().min(1),
  gender: z.string().min(1),
  birthDate: z.coerce
    .date() // Преобразует строку в дату
    .refine((date) => {
      const minAge = 6;
      const today = new Date();
      const birthDateLimit = new Date(
        today.getFullYear() - minAge,
        today.getMonth(),
        today.getDate()
      );
      return date <= birthDateLimit;
    }, "Вам должно быть не менее 6 лет."),
});

