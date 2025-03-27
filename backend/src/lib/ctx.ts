import { PrismaClient } from "@prisma/client";
import { createPrismaClient } from './prisma'
console.log("DATABASE_URL:", process.env.DATABASE_URL);

export const createAppContext = () => {
  const prisma = createPrismaClient()
  return {
    prisma,
    stop: async () => {
      await prisma.$disconnect();
    },
  };
};

export type AppContext = ReturnType<typeof createAppContext>;
