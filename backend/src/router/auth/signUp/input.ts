import { z } from "zod";
import {
  zEmailRequired,
  zNickRequired,
  zStringRequired,
} from "@forum_project/shared/src/zod";

const baseSignUpSchema = z.object({
  nick: zNickRequired,
  email: zEmailRequired,
  password: zStringRequired,
  passwordAgain: zStringRequired,
  surname: z.string().min(1),
  name: z.string().min(1),
  gender: z.string().min(1),
  birthDate: z.coerce
    .date()
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
  role: z.enum(["USER", "EXPERT"]),
  specialty: z.string().min(3).optional(),
  document: z.string().url().optional(),
});

// С помощью `superRefine` можно добавлять свою логику валидации
export const zSignUpTrpcInput = baseSignUpSchema.superRefine((data, ctx) => {
  if (data.password !== data.passwordAgain) {
    ctx.addIssue({
      path: ["passwordAgain"],
      code: "custom",
      message: "Пароли не совпадают",
    });
  }

  if (data.role === "EXPERT") {
    if (!data.specialty || data.specialty.length < 3) {
      ctx.addIssue({
        path: ["specialty"],
        code: "custom",
        message: "Укажите специальность (минимум 3 символа)",
      });
    }
  }
});
