import { z } from "zod";
import { trpcLoggedProcedure } from "../../../lib/trpc";
import { omit } from "@forum_project/shared/src/omit";
import { ExpectedError } from "../../../lib/error";
import { zGetIdeaTrpcInput } from "./input";

export const getIdeaTrpcRoute = trpcLoggedProcedure
  .input(zGetIdeaTrpcInput)
  .query(async ({ ctx, input }) => {
    const rawIdea = await ctx.prisma.idea.findUnique({
      where: {
        nick: input.someNick,
      },
      include: {
        author: {
          select: {
            id: true,
            nick: true,
            name: true,
            avatar: true,
            role: true,
            specialist: {
              select: {
                specialty: true,
                isVerified: true,
              },
            },
          },
        },
        ideasLikes: {
          select: {
            id: true,
          },
          where: {
            userId: ctx.me?.id,
          },
        },
        _count: {
          select: {
            ideasLikes: true,
          },
        },
      },
    });

    if (rawIdea?.blockedAt) {
      throw new ExpectedError("Обсуждение заблокировано администратором");
    }

    const isLikedByMe = !!rawIdea?.ideasLikes.length;
    const likesCount = rawIdea?._count.ideasLikes || 0;

    const idea = rawIdea && {
      ...omit(rawIdea, ["ideasLikes", "_count"]),
      isLikedByMe,
      likesCount,
      author: {
        ...rawIdea.author,
        specialty: rawIdea.author.specialist?.specialty,
        isVerified: rawIdea.author.specialist?.isVerified,
      },
    };

    return { idea };
  });
