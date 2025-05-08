import { pgr } from '../utils/pumpGetRoute'


export const getAdminSpecialistRoute=pgr(() => '/specialists')
export const getSignUpRoute = pgr(() => '/sign-up')

export const getSignInRoute = pgr(() => '/sign-in')



export const getSignOutRoute = pgr(() => '/sign-out')



export const getEditProfileRoute = pgr(() => '/edit-profile')

export const getMyIdeas2Route=pgr(()=>'/my-ideas2')

export const getAllIdeasRoute = pgr(() => '/')

export const getViewIdeaRoute = pgr({ someNick: true }, ({ someNick }) => `/ideas/${someNick}`)

export const getEditIdeaRoute = pgr({ someNick: true }, ({ someNick }) => `/ideas/${someNick}/edit`)
export const getAssistantRoute = pgr(() => '/assistant');
export const getUserAssistantRoute = pgr(
    { someNick: true },
    ({ someNick }) => `/${someNick}/assistant`
  );
export const getUserProfileByNick=pgr({ someNick: true }, ({ someNick }) => `/ideas/${someNick}/profile`)

export const getNewIdeaRoute = pgr(() => '/ideas/new')
export const getMyIdeasRoute=pgr(()=>'/my-ideas')

export const getLikedIdeasRoute=pgr(()=>'/liked-ideas')


