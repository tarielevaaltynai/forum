import * as trpcExpress from '@trpc/server/adapters/express'
import { type Express } from 'express'
import superjson from 'superjson'
import { expressHandler } from 'trpc-playground/handlers/express'
import { type TrpcRouter } from '../router'
import { type AppContext } from './ctx'

  transformer: superjson,
})

export const applyTrpcToExpressApp = async (expressApp: Express, appContext: AppContext, trpcRouter: TrpcRouter) => {
  expressApp.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
      createContext: () => appContext,
    })
  )

  expressApp.use(
    '/trpc-playground',
    await expressHandler({
      trpcApiEndpoint: '/trpc',
      playgroundEndpoint: '/trpc-playground',
      router: trpcRouter,
      request: {
        superjson: true,
      },
    })
  )
}