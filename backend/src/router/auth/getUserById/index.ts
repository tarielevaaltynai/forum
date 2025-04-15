import { z } from "zod";
import { trpc } from "../../../lib/trpc";
import { toClientMe } from '../../../lib/models'
import { ExpectedError } from "../../../lib/error";


export const getUserByIdTrpcRoute = trpc.procedure
  .input(z.object({ id: z.string().uuid() }))
  .query(async ({ input, ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: input.id },
    });

    if (!user) throw new ExpectedError("Пользователь не найден");

    return { user: toClientMe(user) };
  });
