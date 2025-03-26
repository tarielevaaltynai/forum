<<<<<<< HEAD
import { pgr } from '../utils/pumpGetRoute'



export const getSignUpRoute = pgr(() => '/sign-up')

export const getSignInRoute = pgr(() => '/sign-in')



export const getSignOutRoute = pgr(() => '/sign-out')



export const getEditProfileRoute = pgr(() => '/edit-profile')

export const getAllIdeasRoute = pgr(() => '/')

export const getViewIdeaRoute = pgr({ someNick: true }, ({ someNick }) => `/ideas/${someNick}`)

export const getEditIdeaRoute = pgr({ someNick: true }, ({ someNick }) => `/ideas/${someNick}/edit`)

export const getNewIdeaRoute = pgr(() => '/ideas/new')
=======
const getRouteParams=<T extends Record<string,boolean>>(object: T)=>{
    return Object.keys(object).reduce((acc,key)=>({...acc,[key]:`:${key}`}),{}) as Record<keyof T,string>
}
export const getAllIdeasRoute=()=>'/';
export const viewIdeaRouteParams=getRouteParams({someNick:true})
export type ViewIdeaRouteParams=typeof viewIdeaRouteParams

export const editIdeaRouteParams = getRouteParams({ someNick: true })
export type EditIdeaRouteParams = typeof viewIdeaRouteParams
export const getEditIdeaRoute = ({ someNick }: EditIdeaRouteParams) => `/ideas/${someNick}/edit`
export const getViewIdeaRoute = ({ someNick }: ViewIdeaRouteParams) => `/ideas/${someNick}`

export const getNewIdeaRoute = () => '/ideas/new'
export const getEditProfileRoute = () => '/edit-profile'

export const getSignUpRoute = () => '/sign-up'
export const getSignInRoute = () => '/sign-in'
export const getSignOutRoute = () => '/sign-out'
>>>>>>> d7d1fffabf09f567df420b0e3df5ed632c29940c
