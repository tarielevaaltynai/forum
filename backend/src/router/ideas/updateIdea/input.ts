import { zCreateIdeaTrpcInput } from '../createIdea/input'
import { zStringRequired } from '@forum_project/shared/src/zod'
export const zUpdateIdeaTrpcInput = zCreateIdeaTrpcInput.extend({
  ideaId: zStringRequired,
})