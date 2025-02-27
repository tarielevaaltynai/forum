const getRouteParams = <T extends Record<string, boolean>>(object: T) => {
  return Object.keys(object).reduce((acc, key) => ({ ...acc, [key]: `:${key}` }), {}) as Record<keyof T, string>
}

export const getAllIdeasRoute = () => '/'

export const viewIdeaRouteParams = getRouteParams({ ideaNick: true })
export type ViewIdeaRouteParams = typeof viewIdeaRouteParams
export const getViewIdeaRoute = ({ ideaNick }: ViewIdeaRouteParams) => `/ideas/${ideaNick}`
      <p>Description of idea 1...</p>
      <div>
        <p>Text paragrph 1 of idea 1...</p>
        <p>Text paragrph 2 of idea 1...</p>
        <p>Text paragrph 3 of idea 1...</p>
      </div>
    </div>
  )
}