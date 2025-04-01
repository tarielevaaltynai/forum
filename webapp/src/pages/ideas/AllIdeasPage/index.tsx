import { getViewIdeaRoute } from '../../../lib/routes';
import {trpc} from '../../../lib/trpc';
import { Segment } from '../../../components/Segment'
import {Link} from 'react-router-dom'
import css from './index.module.scss'
import { Alert } from '../../../components/Alert'
import InfiniteScroll from 'react-infinite-scroller'
import { layoutContentElRef } from '../../../components/Layout'
import { Loader } from '../../../components/Loader'
import { useDebounce } from "usehooks-ts";
import * as hooks from "usehooks-ts";
import { withPageWrapper } from '../../../lib/pageWrapper'
console.log(hooks);

import { Input } from '../../../components/Input'
import { useForm } from '../../../lib/form'
import { zGetIdeasTrpcInput } from '@forum_project/backend/src/router/ideas/getIdeas/input'
export const AllIdeasPage = withPageWrapper({
  title: 'Beauty and Health',
  isTitleExact: true,
})(() => {

  const { formik } = useForm({
    initialValues: { search: '' },
    validationSchema: zGetIdeasTrpcInput.pick({ search: true }),
  })
  const search = useDebounce(formik.values.search, 500)
  const { data, error, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage, isRefetching } =
  
  trpc.getIdeas.useInfiniteQuery(
    {
      search,
    },

    {
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor
      },
    }
  )
  

    return (
      
      <Segment title="Форум">
              <div className={css.filter}>
        <Input maxWidth={'100%'} label="Поиск" name="search" formik={formik} />
      </div>

{isLoading || isRefetching ? (
        <Loader type="section" />
      ) : isError ? (
        <Alert color="red">{error.message}</Alert>
      ) : !data.pages[0].ideas.length ? (
        <Alert color="brown">Ничего не найденно</Alert>
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
                    >
                    Лайки: {idea.likesCount}
                  </Segment>
                </div>
              ))}
          </InfiniteScroll>
      </div>
      )}
      </Segment>
    )
  })
