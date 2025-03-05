const getRouteParams=<T extends Record<string,boolean>>(object: T)=>{
    return Object.keys(object).reduce((acc,key)=>({...acc,[key]:`:${key}`}),{}) as Record<keyof T,string>
}
export const getAllIdeasRoute=()=>'/';

export type ViewIdeaRouteParams=typeof viewIdeaRouteParams
export const viewIdeaRouteParams=getRouteParams({someNick:true})
export const editIdeaRouteParams = getRouteParams({ someNick: true })
export type EditIdeaRouteParams = typeof viewIdeaRouteParams
export const getEditIdeaRoute = ({ someNick }: EditIdeaRouteParams) => `/ideas/${someNick}/edit`
export const getViewIdeaRoute = ({ someNick }: ViewIdeaRouteParams) => `/ideas/${someNick}`

export const getNewIdeaRoute = () => '/ideas/new'
export const getSignUpRoute = () => '/sign-up'
export const getSignInRoute = () => '/sign-in'
export const getSignOutRoute = () => '/sign-out'