import { z } from 'zod';
import { 
  zStringRequired,
  zStringMin,
  zStringOptional
} from '@forum_project/shared/src/zod';

// Создание комментария
export const zCreateReplyTrpcInput = z.object({
  ideaId: zStringRequired,
  content: zStringMin(1).max(2000),
  parentId: zStringOptional, // для ответов
});