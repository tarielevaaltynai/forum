// backend/src/router/users/getUserProfile/input.ts
import { z } from 'zod';

export const zGetUserProfileInput = z.object({
  userId: z.string().uuid(),
});