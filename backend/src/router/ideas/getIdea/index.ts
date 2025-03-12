import { z } from 'zod'
import { trpc } from '../../../lib/trpc'

export const getIdeaTrpcRoute = trpc.procedure
  .input(
    z.object({
      someNick: z.string(),
    })
  )
  .query(async ({ ctx, input }) => {
    const idea = await ctx.prisma.idea.findUnique({
      where: {
        nick: input.someNick,


      },
      include:{
        author:{
          select:{
            id:true,
            nick:true,
            name: true,
          },
        },
      },
    })
   
    return { idea }
  })
