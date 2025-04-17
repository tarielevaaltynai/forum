import { trpcLoggedProcedure } from "../../../lib/trpc";
import _ from "lodash";
import { zGetIdeasTrpcInput } from "../getIdeas/input";

interface InputParams {
  cursor?: number;
  limit: number;
  search?: string;
}

interface RawIdea {
  id: string;
  nick: string;
  name: string;
  description: string;
  text?: string;
  createdAt: Date;
  serialNumber: number;
  _count: {
    ideasLikes: number;
  };
  author: {
    nick: string;
    name: string | null;
    avatar: string | null;
  };
}

export const getMyIdeasTrpcRoute = trpcLoggedProcedure
  .input(zGetIdeasTrpcInput)
  .query(async ({ ctx, input }) => {
    if (!ctx.prisma || !ctx.me?.id) {
      throw new Error("PrismaClient or user is not available in context");
    }

    const userId = ctx.me.id;
    const { cursor, limit } = input;

    const rawIdeas = await ctx.prisma.idea.findMany({
      select: {
        id: true,
        nick: true,
        name: true,
        description: true,
        createdAt: true,
        serialNumber: true,
        _count: { select: { ideasLikes: true } },
        author: {
          select: {
            nick: true,
            name: true,
            avatar: true,
          },
        },
      },
      where: {
        blockedAt: null,
        authorId: userId,
      },
      orderBy: [{ createdAt: "desc" }, { serialNumber: "desc" }],
      cursor: cursor ? { serialNumber: cursor } : undefined,
      take: limit + 1,
    });

    const nextIdea = rawIdeas.at(limit);
    const nextCursor = nextIdea?.serialNumber;
    const ideasExceptNext = rawIdeas.slice(0, limit).map((idea: RawIdea) => ({
      ..._.omit(idea, ["_count"]),
      likesCount: idea._count.ideasLikes,
    }));

    return {
      ideas: ideasExceptNext,
      nextCursor,
    };
  });
