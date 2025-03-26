import { PrismaClient } from "@prisma/client";

console.log("DATABASE_URL:", process.env.DATABASE_URL);

export const createAppContext = () => {
  const prisma = new PrismaClient();
  return {
    prisma,
    stop: async () => {
      await prisma.$disconnect();
    },
  };
};

export type AppContext = ReturnType<typeof createAppContext>;
