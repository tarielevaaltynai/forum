import { trpcLoggedProcedure } from "../../../lib/trpc";
import _ from "lodash";
import { zGetIdeasTrpcInput } from "./input";
import { TrpcContext } from "../../../lib/trpc";

interface IdeaWithCount {
  id: string;
  nick: string;
  name: string;
  description: string;
  createdAt: Date;
  serialNumber: number;
  images: any; 
  _count: {
    ideasLikes: number;
  };
  author: {
    nick: string;
    name: string | null;
    avatar: string | null;
    specialist?: {
      specialty: string | null;
      isVerified: boolean;
    };
  };
  isLikedByMe?: boolean;
}

interface InputParams {
  cursor?: number;
  limit: number;
  search?: string;
}

export const getIdeasTrpcRoute = trpcLoggedProcedure
  .input(zGetIdeasTrpcInput)
  .query(async ({ ctx, input }: { ctx: TrpcContext; input: InputParams }) => {
    if (!ctx.prisma) {
      throw new Error("PrismaClient is not defined in the context");
    }

    const { search: searchQuery, cursor, limit } = input;
    const trimmedSearch = searchQuery?.trim();

    if (!trimmedSearch || trimmedSearch.length < 2) {
      return getDefaultIdeasList(ctx, { cursor, limit });
    }

    try {
      const rawIdeas = await ctx.prisma.idea.findMany({
        select: {
          id: true,
          nick: true,
          name: true,
          description: true,
          text: true,
          createdAt: true,
          serialNumber: true,
          images: true,
          _count: { select: { ideasLikes: true } },
          author: {
            select: {
              nick: true,
              name: true,
              avatar: true,
              specialist: {
                select: {
                  specialty: true,
                  isVerified: true,
                },
              },
            },
          },
        },
        where: {
          blockedAt: null,
          OR: [
            { name: { contains: trimmedSearch, mode: "insensitive" } },
            { description: { contains: trimmedSearch, mode: "insensitive" } },
            { text: { contains: trimmedSearch, mode: "insensitive" } },
          ],
        },
        orderBy: [{ createdAt: "desc" }, { serialNumber: "desc" }],
        cursor: cursor ? { serialNumber: cursor } : undefined,
        take: limit + 1,
      });

      const nextIdea = rawIdeas.at(limit);
      const nextCursor = nextIdea?.serialNumber;
      const ideasExceptNext = rawIdeas.slice(0, limit).map((idea) => ({
        ..._.omit(idea, ["_count"]),
        likesCount: idea._count.ideasLikes,
        author: {
          nick: idea.author.nick,
          name: idea.author.name,
          avatar: idea.author.avatar,
          specialty: idea.author.specialist?.specialty,
          isVerified: idea.author.specialist?.isVerified,
        },
      }));

      return {
        ideas: ideasExceptNext,
        nextCursor,
      };
    } catch (error) {
      console.error("Search error:", error);
      return getDefaultIdeasList(ctx, { cursor, limit });
    }
  });

async function getDefaultIdeasList(ctx: TrpcContext, input: InputParams) {
  if (!ctx.prisma) {
    throw new Error("PrismaClient is not available in the context");
  }

  const rawIdeas = await ctx.prisma.idea.findMany({
    select: {
      id: true,
      nick: true,
      name: true,
      description: true,
      text: true,
      createdAt: true,
      serialNumber: true,
      images: true,
      _count: { select: { ideasLikes: true } },
      author: {
        select: {
          nick: true,
          name: true,
          avatar: true,
          specialist: {
            select: {
              specialty: true,
              isVerified: true,
            },
          },
        },
      },
    },
    where: {
      blockedAt: null,
    },
    orderBy: [{ createdAt: "desc" }, { serialNumber: "desc" }],
    cursor: input.cursor ? { serialNumber: input.cursor } : undefined,
    take: input.limit + 1,
  });

  const nextIdea = rawIdeas.at(input.limit);
  const nextCursor = nextIdea?.serialNumber;
  const ideasExceptNext = rawIdeas.slice(0, input.limit).map((idea) => ({
    ..._.omit(idea, ["_count"]),
    likesCount: idea._count.ideasLikes,
    author: {
      nick: idea.author.nick,
      name: idea.author.name,
      avatar: idea.author.avatar,
      specialty: idea.author.specialist?.specialty,
      isVerified: idea.author.specialist?.isVerified,
    },
  }));

  return {
    ideas: ideasExceptNext,
    nextCursor,
  };
}