import { initTRPC, type inferAsyncReturnType } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { type Express } from 'express';
import { type TrpcRouter } from '../router';
import { type AppContext } from './ctx';
import superjson from 'superjson';
import { type ExpressRequest } from '../utils/types';
import { expressHandler } from 'trpc-playground/handlers/express';
import { logger } from './logger';
import { ExpectedError } from './error';

import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();

export const getTrpcContext = ({ appContext, req }: { appContext: AppContext; req: ExpressRequest }) => ({
  ...appContext,
  me: req.user || null,
});

const getCreateTrpcContext =
  (appContext: AppContext) =>
  ({ req }: trpcExpress.CreateExpressContextOptions) =>
    getTrpcContext({ appContext, req: req as ExpressRequest });

// Экспортируем TrpcContext явно
export type TrpcContext = inferAsyncReturnType<ReturnType<typeof getCreateTrpcContext>>;

const trpc = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => {
    const isExpected = error.cause instanceof ExpectedError;
    return {
      ...shape,
      data: {
        ...shape.data,
        isExpected,
      },
    };
  },
});

export const createTrpcRouter = trpc.router;

export const trpcLoggedProcedure = trpc.procedure.use(
  trpc.middleware(async ({ path, type, next, ctx, rawInput }) => {
    const start = Date.now();
    const result = await next();
    const durationMs = Date.now() - start;
    const meta = {
      path,
      type,
      userId: ctx.me?.id || null,
      durationMs,
      rawInput: rawInput || null,
    };
    if (result.ok) {
      logger.info(`trpc:${type}:success`, 'Successfull request', { ...meta, output: result.data });
    } else {
      logger.error(`trpc:${type}:error`, result.error, meta);
    }
    return result;
  })
);

export const applyTrpcToExpressApp = async (
  expressApp: Express,
  appContext: AppContext,
  trpcRouter: TrpcRouter
) => {
  console.log("🔹 Инициализация TRPC Middleware...");

  expressApp.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
      router: trpcRouter,
      createContext: getCreateTrpcContext(appContext),
    })
  );

  console.log("✅ TRPC Middleware подключено!");

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
  );

  console.log("✅ TRPC Playground подключен!");
};
export const publicProcedure = trpc.procedure;
export { trpc };