import { cloudinaryUploadTypes } from '@forum_project/shared/src/cloudinary'
import { getKeysAsArray } from '@forum_project/shared/src/getKeysAsArray'
import { z } from 'zod'

export const zPrepareCloudinaryUploadTrpcInput = z.object({
  type: z.enum(getKeysAsArray(cloudinaryUploadTypes)),
})