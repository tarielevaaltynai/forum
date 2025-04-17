// backend/src/router/users/blockUser/input.ts
import { z } from 'zod';

export const zBlockUserInput = z.object({
  userId: z.string().uuid(),
  blocked: z.boolean(),
});
