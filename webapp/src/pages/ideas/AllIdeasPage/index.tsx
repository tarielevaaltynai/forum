import { getViewIdeaRoute } from '../../../lib/routes';
import {trpc} from '../../../lib/trpc';
import { Segment } from '../../../components/Segment'
import {Link} from 'react-router-dom'
import css from './index.module.scss'
import { Alert } from '../../../components/Alert'
import InfiniteScroll from 'react-infinite-scroller'
import { layoutContentElRef } from '../../../components/Layout'
import { Loader } from '../../../components/Loader'


export const AllIdeasPage = () => {
  const { data, error, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage, isRefetching } =
  
  trpc.getIdeas.useInfiniteQuery(
    {},

    {
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor
      },
    }
  )
  

    return (
      
      <Segment title="Форум">
        

{isLoading || isRefetching ? (
        <Loader type="section" />
      ) : isError ? (
        <Alert color="red">{error.message}</Alert>
      ) : (
        <div className={css.ideas}>
                   <InfiniteScroll
            threshold={250}
            loadMore={() => {
              if (!isFetchingNextPage && hasNextPage) {
                void fetchNextPage()
              }
            }}
            hasMore={hasNextPage}
            loader={
              <div className={css.more} key="loader">
               <Loader type="section" />


              </div>
            }
            getScrollParent={() => layoutContentElRef.current}
            useWindow={(layoutContentElRef.current && getComputedStyle(layoutContentElRef.current).overflow) !== 'auto'}
          >
            {data.pages
              .flatMap((page) => page.ideas)
              .map((idea) => (
                <div className={css.idea} key={idea.nick}>
                  <Segment
                    size={2}
                    title={
                      <Link className={css.ideaLink} to={getViewIdeaRoute({ someNick: idea.nick })}>
                        {idea.name}
                      </Link>
                    }
                    description={idea.description}
                  />
                </div>
              ))}
          </InfiniteScroll>
      </div>
      )}
      </Segment>
    )
  }