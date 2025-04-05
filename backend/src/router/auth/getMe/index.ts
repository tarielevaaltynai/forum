import { toClientMe } from '../../../lib/models'
import { trpcLoggedProcedure } from '../../../lib/trpc'


export const getMeTrpcRoute = trpcLoggedProcedure.query(({ ctx }) => {
  const me = toClientMe(ctx.me);
  return { me };
})