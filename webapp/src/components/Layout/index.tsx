/*import {Link,Outlet} from 'react-router-dom'
import { getAllIdeasRoute, getNewIdeaRoute, getSignInRoute, getSignOutRoute, getSignUpRoute } from '../../lib/routes'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'
export const Layout=()=>{
  const { data, isLoading, isFetching, isError } = trpc.getMe.useQuery()

    return (
      <div className={css.layout}>
      <div className={css.navigation}>
        <div className={css.logo}>Ideas</div>
        <ul className={css.menu}>
          <li className={css.item}>
            <Link className={css.link} to={getAllIdeasRoute()}>
              All Ideas
            </Link>
          </li>
          {isLoading || isFetching || isError ? null : data.me ? (
            <>
              <li className={css.item}>
                <Link className={css.link} to={getNewIdeaRoute()}>
                  Add Idea
                </Link>
              </li>
              <li className={css.item}>
                <Link className={css.link} to={getSignOutRoute()}>
                  Log Out ({data.me.nick})
                </Link>
              </li>
            </>
          ) : (
            <>
              <li className={css.item}>
                <Link className={css.link} to={getSignUpRoute()}>
                  Sign Up
                </Link>
              </li>
              <li className={css.item}>
                <Link className={css.link} to={getSignInRoute()}>
                  Sign In
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
      <div className={css.content}>
                <Outlet/>
            </div>
        </div>
    )
}
*/ /*
import { Link, Outlet } from 'react-router-dom';
import { getAllIdeasRoute, getNewIdeaRoute, getSignInRoute, getSignOutRoute, getSignUpRoute } from '../../lib/routes';
import { trpc } from '../../lib/trpc';
import { LeftMenu } from '../LeftMenu'; // Правильный импорт LeftMenu
import css from './index.module.scss';

export const Layout = () => {
  const { data, isLoading, isError } = trpc.getMe.useQuery();
  const isAuthenticated = !isLoading && !isError && data?.me;

  return (
    <div className={css.layout}>
      <div className={css.navigation}>
        <div className={css.logo}>Ideas</div>
        <ul className={css.menu}>
          <li className={css.item}>
            <Link className={css.link} to={getAllIdeasRoute()}>
              All Ideas
            </Link>
          </li>
          {isAuthenticated ? (
            <>
              <li className={css.item}>
                <Link className={css.link} to={getNewIdeaRoute()}>
                  Add Idea
                </Link>
              </li>
              <li className={css.item}>
                <Link className={css.link} to={getSignOutRoute()}>
                  Log Out ({data.me.nick})
                </Link>
              </li>
            </>
          ) : (
            <>
              <li className={css.item}>
                <Link className={css.link} to={getSignUpRoute()}>
                  Sign Up
                </Link>
              </li>
              <li className={css.item}>
                <Link className={css.link} to={getSignInRoute()}>
                  Sign In
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
      <div className={css.mainContent}>
        {isAuthenticated && <LeftMenu />} {}
        <div className={css.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};*/
import { createRef } from "react";
import { Link, Outlet } from "react-router-dom";
import {
  getAllIdeasRoute,
  getNewIdeaRoute,
  getSignInRoute,
  getSignOutRoute,
  getSignUpRoute,
} from "../../lib/routes";
import { LeftMenu } from "../LeftMenu";
import { Button } from "../Button";
import css from "./index.module.scss";
import { useMe } from "../../lib/ctx";
export const layoutContentElRef = createRef<HTMLDivElement>();

export const Layout = () => {
  const me = useMe();

  return (
    <div className={css.layout}>
      <header className={css.header}>
        <div className={css.headerContent}>
          <Link to={getAllIdeasRoute()} className={css.logo}>
            <span>Beauty</span>&<span>Health</span>
          </Link>

          <nav className={css.nav}>
            {!me && (
              <ul className={css.authMenu}>
                <li>
                  <Link to={getSignUpRoute()}>
                    <Button variant="blue" size="small">
                      Регистрация
                    </Button>
                  </Link>
                </li>
                <li>
                  <Link to={getSignInRoute()}>
                    <Button variant="white-with-blue-border" size="small">
                      Вход
                    </Button>
                  </Link>
                </li>
              </ul>
            )}
          </nav>
        </div>
      </header>

      <main className={css.main}>
        {me && <LeftMenu />}
        <div
          className={me ? css.content : css.fullWidthContent}
          ref={layoutContentElRef}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
};
