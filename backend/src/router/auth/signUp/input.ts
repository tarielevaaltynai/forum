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
  specialty: z.string().optional(), // Не обязательное поле для любого пользователя
  document: z.string().optional(), // Не обязательное поле для любого пользователя
});

export const zSignUpTrpcInput = baseSignUpSchema.superRefine((data, ctx) => {
  if (data.password !== data.passwordAgain) {
    ctx.addIssue({
      path: ["passwordAgain"],
      code: "custom",
      message: "Пароли не совпадают",
    });
  }

  if (data.role === "EXPERT") {
    // Проверка на специальность и документ, только если роль EXPRT
    if (!data.specialty || data.specialty.trim().length < 3) {
      ctx.addIssue({
        path: ["specialty"],
        code: "too_small",
        minimum: 3,
        type: "string",
        inclusive: true,
        message: "Укажите специальность (минимум 3 символа)",
      });
    }

    if (!data.document || !/^https?:\/\/.+/.test(data.document)) {
      ctx.addIssue({
        path: ["document"],
        code: "invalid_string",
        validation: "url",
        message: "Укажите корректную ссылку на документ",
      });
    }
  } else {
    // Если роль USER, то не должно быть specialty и document
    if (data.specialty || data.document) {
      ctx.addIssue({
        path: ["specialty"],
        code: "custom",
        message: "Пользователи не могут иметь специальность или документ",
      });
    }
  }
});
