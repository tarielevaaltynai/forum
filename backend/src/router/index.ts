
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
import { askQuestionTrpcRoute } from "./assistant/askQuestion";
import { getSessionHistoryTrpcRoute } from "./assistant/getSessionHistory";
import { getSessionsTrpcRoute } from './assistant/getSessions';
import { getSessionMessagesTrpcRoute } from './assistant/getSessionMessages';
import { createSessionTrpcRoute } from './assistant/createSession';
import { deleteSessionTrpcRoute } from './assistant/deleteSession';
import { deleteAllSessionsTrpcRoute } from './assistant/deleteAllSessions';
import { getMyIdeasTrpcRoute } from "./ideas/getMyIdeas";
import { rejectSpecialist } from "./ideas/getUnverifiedSpecialists";
import { verifySpecialist } from "./ideas/getUnverifiedSpecialists";
import { getUserByIdTrpcRoute } from "./auth/getUserById"; // ⬅️ ДОБАВЬ

// @endindex
import { prepareS3UploadTrpcRoute } from './upload/prepareS3Upload'
import { getCurrentUserTrpcRoute } from "./auth/getCurrentUser";
import { getUserProfileTrpcRoute } from "./ideas/getUserProfile";
import {  getUserProfileByNickTrpcRoute } from "./auth/getUserProfileByNick";
import { getUserIdeasByNickTrpcRoute } from "./ideas/getUserIdeasByNick";
import { getPopularUsersTrpcRoute } from "./ideas/getPopularUsers";
import { create } from "lodash";
export const trpcRouter = createTrpcRouter({
  getCurrentUser:getCurrentUserTrpcRoute,
  // @index('./**/index.ts', f => `${f.path.split('/').slice(0, -1).pop()}: ${f.path.split('/').slice(0, -1).pop()}TrpcRoute,`)

getLikedIdeas:getLikedIdeasTrpcRoute,
createReply:createReplyTrpcRoute,
  getMe: getMeTrpcRoute,
 
    askQuestion: askQuestionTrpcRoute,
    getSessionHistory: getSessionHistoryTrpcRoute,
    getSessions: getSessionsTrpcRoute,
    getSessionMessages: getSessionMessagesTrpcRoute,
    createSession: createSessionTrpcRoute,
    deleteSession: deleteSessionTrpcRoute,
  deleteAllSessions: deleteAllSessionsTrpcRoute,

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

  createIdea: createIdeaTrpcRoute,
  getIdea: getIdeaTrpcRoute,
  
  getIdeas: getIdeasTrpcRoute,
  setIdeaLike: setIdeaLikeTrpcRoute,
  updateIdea: updateIdeaTrpcRoute,

  getUserById: getUserByIdTrpcRoute,
  
  prepareCloudinaryUpload: prepareCloudinaryUploadTrpcRoute,


  

  getMyIdeas: getMyIdeasTrpcRoute,

  getUserProfile:getUserProfileTrpcRoute,
  getUserProfileByNick:getUserProfileByNickTrpcRoute,
  getUserIdeasByNick:getUserIdeasByNickTrpcRoute,
  getPopularUsers:getPopularUsersTrpcRoute


  // @endindex
})
export type TrpcRouter = typeof trpcRouter
export type TrpcRouterInput = inferRouterInputs<TrpcRouter>
export type TrpcRouterOutput = inferRouterOutputs<TrpcRouter>


