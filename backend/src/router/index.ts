import { createTrpcRouter } from "../lib/trpc";
import { getLikedIdeasTrpcRoute } from "./ideas/getLikedIdeas";
// @index('./**/index.ts', f => `import { ${f.path.split('/').slice(0, -1).pop()}TrpcRoute } from '${f.path.split('/').slice(0, -1).join('/')}'`)
import { getMeTrpcRoute } from "./auth/getMe";
import { signInTrpcRoute } from "./auth/signIn";
import { signUpTrpcRoute } from "./auth/signUp";

import {getUnverifiedSpecialists} from "./ideas/getUnverifiedSpecialists"
import { createIdeaTrpcRoute } from "./ideas/createIdea";
import { getIdeaTrpcRoute } from "./ideas/getIdea";
import { setIdeaLikeTrpcRoute } from "./ideas/setIdeaLIke";
import { getIdeasTrpcRoute } from "./ideas/getIdeas";
import { updateIdeaTrpcRoute } from "./ideas/updateIdea";
import { updateProfileTrpcRoute } from "./auth/updateProfile";
import { updatePasswordTrpcRoute } from "./auth/updatePassword";
import { updateAvatarTrpcRoute } from "./auth/updateAvatar";
import { prepareCloudinaryUploadTrpcRoute } from "./upload/prepareCloudinaryUpload";
import { blockIdeaTrpcRoute } from "./ideas/blockIdea";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { createCommentTrpcRoute } from "./ideas/createComment";
import { getCommentsTrpcRoute } from "./ideas/getComments";
import { getRepliesTrpcRoute } from "./ideas/getReplies";
import { createReplyTrpcRoute } from "./ideas/createReply";
import { getMyIdeasTrpcRoute } from "./ideas/getMyIdeas";
import { rejectSpecialist } from "./ideas/getUnverifiedSpecialists";
import { verifySpecialist } from "./ideas/getUnverifiedSpecialists";
// @endindex
import { prepareS3UploadTrpcRoute } from './upload/prepareS3Upload'
export const trpcRouter = createTrpcRouter({
  // @index('./**/index.ts', f => `${f.path.split('/').slice(0, -1).pop()}: ${f.path.split('/').slice(0, -1).pop()}TrpcRoute,`)
getLikedIdeas:getLikedIdeasTrpcRoute,
  getMe: getMeTrpcRoute,
  verifySpecialist:verifySpecialist,
  rejectSpecialist:rejectSpecialist,
  getUnverifiedSpecialists:getUnverifiedSpecialists,
  signIn: signInTrpcRoute,
  signUp: signUpTrpcRoute,
  updateProfile: updateProfileTrpcRoute,
  updateAvatar: updateAvatarTrpcRoute,
  createComment: createCommentTrpcRoute,
  getComments: getCommentsTrpcRoute,
  getReplies: getRepliesTrpcRoute,
  prepareS3Upload: prepareS3UploadTrpcRoute,
  blockIdea: blockIdeaTrpcRoute,
  updatePassword: updatePasswordTrpcRoute,
  createReply: createReplyTrpcRoute,
  createIdea: createIdeaTrpcRoute,
  getIdea: getIdeaTrpcRoute,
  getIdeas: getIdeasTrpcRoute,
  setIdeaLike: setIdeaLikeTrpcRoute,
  updateIdea: updateIdeaTrpcRoute,
  prepareCloudinaryUpload: prepareCloudinaryUploadTrpcRoute,
  getMyIdeas: getMyIdeasTrpcRoute,
  // @endindex
});

export type TrpcRouter = typeof trpcRouter;
export type TrpcRouterInput = inferRouterInputs<TrpcRouter>;
export type TrpcRouterOutput = inferRouterOutputs<TrpcRouter>;
