// src/pages/PopularUsersPage.tsx
import { trpc } from "../../../lib/trpc";
import { Segment } from "../../../components/Segment";
import { Link } from "react-router-dom";
import css from "./index.module.scss";
import { Alert } from "../../../components/Alert";
import InfiniteScroll from "react-infinite-scroller";
import { layoutContentElRef } from "../../../components/Layout";
import { Loader } from "../../../components/Loader";
import { useDebounce } from "usehooks-ts";
import { withPageWrapper } from "../../../lib/pageWrapper";
import { getAvatarUrl } from "@forum_project/shared/src/cloudinary";
import { Icon } from "../../../components/Icon";
import { Input } from "../../../components/Input";
import { useForm } from "../../../lib/form";
import { zGetPopularUsersInput } from "@forum_project/backend/src/router/users/popularUsers";

export const PopularUsersPage = withPageWrapper({
  title: "Popular Users",
  isTitleExact: true,
})(() => {
  const { formik } = useForm({
    initialValues: { search: "" },
    validationSchema: zGetPopularUsersInput.pick({ search: true }),
  });
  
  const search = useDebounce(formik.values.search, 500);
  
  const {
    data,
    error,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isRefetching,
  } = trpc.getPopularUsers.useInfiniteQuery(
    { search },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <Segment title="Popular Users">
      <div className={css.filter}>
        <Input label="Search users" name="search" formik={formik} />
      </div>
      
      {isLoading || isRefetching ? (
        <Loader type="section" />
      ) : isError ? (
        <Alert color="red">{error.message}</Alert>
      ) : !data?.pages[0]?.users.length ? (
        <Alert color="brown">No users found</Alert>
      ) : (
        <div className={css.users}>
          <InfiniteScroll
            threshold={250}
            loadMore={() => {
              if (!isFetchingNextPage && hasNextPage) {
                void fetchNextPage();
              }
            }}
            hasMore={hasNextPage}
            loader={
              <div className={css.more} key="loader">
                <Loader type="section" />
              </div>
            }
            getScrollParent={() => layoutContentElRef.current}
            useWindow={
              (layoutContentElRef.current &&
                getComputedStyle(layoutContentElRef.current).overflow) !==
              "auto"
            }
          >
            {data.pages
              .flatMap((page) => page.users)
              .map((user) => (
                <div className={css.user} key={user.id}>
                  <Segment size={2}>
                    <div className={css.userHeader}>
                      <img
                        className={css.avatar}
                        src={getAvatarUrl(user.avatar, "medium")}
                        alt={user.nick}
                      />
                      <div className={css.userInfo}>
                        <Link 
                          to={`/user/${user.nick}`} 
                          className={css.nick}
                        >
                          @{user.nick}
                        </Link>
                        {user.name && (
                          <div className={css.name}>{user.name}</div>
                        )}
                        {user.specialty && (
                          <div className={css.specialty}>
                            <Icon name="verified" />
                            {user.specialty}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={css.stats}>
                      <div className={css.stat}>
                        <Icon name="users" />
                        {user.followersCount.toLocaleString()} followers
                      </div>
                      <div className={css.stat}>
                        <Icon name="idea" />
                        {user.ideasCount} ideas
                      </div>
                      <div className={css.stat}>
                        <Icon name="like" />
                        {user.avgLikes} avg likes
                      </div>
                    </div>

                    <div className={css.actions}>
                      <button className={css.followButton}>
                        <Icon name="addUser" />
                        Follow
                      </button>
                    </div>
                  </Segment>
                </div>
              ))}
          </InfiniteScroll>
        </div>
      )}
    </Segment>
  );
});