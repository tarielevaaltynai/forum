// import { toClientMe } from "../../../lib/models";
// import { trpcLoggedProcedure } from "../../../lib/trpc";
// import { zUpdateAvatarTrpcInput } from "./input";
// // src/router/auth/updateAvatar/index.ts
// import { TRPCError } from "@trpc/server";

// export const updateAvatarTrpcRoute = trpcLoggedProcedure
//   .input(zUpdateAvatarTrpcInput) // Убедитесь, что используете zod-схему для валидации
//   .mutation(async ({ ctx, input }) => {
//     // Проверка на наличие ctx.me
//     if (!ctx.me) {
//       throw new TRPCError({
//         code: "UNAUTHORIZED",
//         message: "Вы не авторизованы",
//       });
//     }

//     // Если avatar не передан, просто оставляем его как есть (undefined)
//     if (input?.avatar === undefined) {
//       return ctx.prisma.user.update({
//         where: { id: ctx.me.id },
//         data: {
//           // Здесь не обновляем поле avatar
//         },
//       });
//     }

//     // Если avatar передан, обновляем его в базе
//     const updatedUser = await ctx.prisma.user.update({
//       where: { id: ctx.me.id },
//       data: {
//         avatar: input.avatar, // Передаем новый аватар
//       },
//     });

//     return updatedUser;
//   });

import { toClientMe } from "../../../lib/models";
import { trpcLoggedProcedure } from "../../../lib/trpc";
import { zUpdateAvatarTrpcInput } from "./input";
// src/router/auth/updateAvatar/index.ts
import { TRPCError } from "@trpc/server";

export const updateAvatarTrpcRoute = trpcLoggedProcedure
  .input(zUpdateAvatarTrpcInput) // Убедитесь, что используете zod-схему для валидации
  .mutation(async ({ ctx, input }) => {
    // Проверка на наличие ctx.me
    if (!ctx.me) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Вы не авторизованы",
      });
    }

    let updatedUser;

    if (input?.avatar !== undefined) {
      // Обновляем аватар
      console.log("Полученный avatar:", input.avatar);

      updatedUser = await ctx.prisma.user.update({
        where: { id: ctx.me.id },
        data: {
          avatar: input.avatar, // Сохраняем новый аватар
        },
      });
    } else {
      // Если аватар не передан, не обновляем
      updatedUser = await ctx.prisma.user.update({
        where: { id: ctx.me.id },
        data: {}, // Не меняем аватар
      });
    }
    console.log("Обновленный пользователь:", updatedUser);
    return toClientMe(updatedUser); // Возвращаем обновленного пользователя
  });
