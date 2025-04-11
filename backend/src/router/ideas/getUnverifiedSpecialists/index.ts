import { trpcLoggedProcedure } from '../../../lib/trpc';
import { z } from 'zod';

// 1. Fetch pending specialists (unverified with documents)
export const getUnverifiedSpecialists = trpcLoggedProcedure.query(async ({ ctx }) => {
  // Fetch specialists who are not verified AND have a document uploaded
  const specialists = await ctx.prisma.specialist.findMany({
    where: { 
      isVerified: false,
      document: {
        not: null
      }
    },
    select: {
      id: true,
      userId: true,
      specialty: true,
      document: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return specialists;
});

// 2. Verify specialist's document
export const verifySpecialistInput = z.object({
  specialistId: z.string().uuid(),
});

export const verifySpecialist = trpcLoggedProcedure
  .input(verifySpecialistInput)
  .mutation(async ({ ctx, input }) => {
    console.log("Verifying specialist:", input.specialistId);  // Логирование ID
    try {
      const updatedSpecialist = await ctx.prisma.specialist.update({
        where: { id: input.specialistId },
        data: { isVerified: true },
      });
      return updatedSpecialist;
    } catch (error) {
      console.error("Error verifying specialist:", error);  // Логирование ошибки
      throw new Error("Verification failed");
    }
  });

// 3. Reject specialist's document (Set document to null and isVerified to false)
export const rejectSpecialistInput = z.object({
  specialistId: z.string().uuid(),
});

export const rejectSpecialist = trpcLoggedProcedure
  .input(rejectSpecialistInput)
  .mutation(async ({ ctx, input }) => {
    // Set the document field to null and mark the specialist as unverified
    const updatedSpecialist = await ctx.prisma.specialist.update({
      where: { id: input.specialistId },
      data: { document: null, isVerified: false },
    });

    return updatedSpecialist;
  });