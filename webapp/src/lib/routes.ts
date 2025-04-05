import { pgr } from '../utils/pumpGetRoute'



export const getSignUpRoute = pgr(() => '/sign-up')

export const getSignInRoute = pgr(() => '/sign-in')



export const getSignOutRoute = pgr(() => '/sign-out')



export const getEditProfileRoute = pgr(() => '/edit-profile')

export const getAllIdeasRoute = pgr(() => '/')

export const getViewIdeaRoute = pgr({ someNick: true }, ({ someNick }) => `/ideas/${someNick}`)

export const getEditIdeaRoute = pgr({ someNick: true }, ({ someNick }) => `/ideas/${someNick}/edit`)

export const getNewIdeaRoute = pgr(() => '/ideas/new')
export const getMyIdeasRoute=pgr(()=>'/my-ideas')

