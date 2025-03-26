<<<<<<< HEAD
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
*//*
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
import { createRef } from 'react'
import { Link, Outlet } from 'react-router-dom';
import { getAllIdeasRoute, getNewIdeaRoute, getSignInRoute, getSignOutRoute, getSignUpRoute } from '../../lib/routes';
import { trpc } from '../../lib/trpc';
import { ReactComponent as Logo } from '../../assets/images/beauty_icon.svg'
import { LeftMenu } from '../LeftMenu';
import { Button } from '../Button';
import css from './index.module.scss';
import { useMe } from '../../lib/ctx'
export const layoutContentElRef = createRef<HTMLDivElement>()

export const Layout = () => {
  const me = useMe()
  console.log('Layout re-rendered, me:', me);

  return (
    <div className={css.layout}>
      <div className={css.navigation}>
   {/*<Logo className={css.logo} />*/}
        <ul className={css.menu}>
          
          {me? (
            <>
              
            
            </>
          ) : (
            <>
              <li className={css.item}>
                <Link to={getSignUpRoute()}>
                  <Button variant="blue">Регистрация</Button> {/* Белая кнопка с синим краем */}
                </Link>
              </li>
              <li className={css.item}>
                <Link to={getSignInRoute()}>
                  <Button variant="white-with-blue-border">Логин</Button> {/* Синяя кнопка */}
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
      <div className={css.mainContent}>
        {me && <LeftMenu />}
        <div className={css.content} ref={layoutContentElRef}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

=======
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
import { ReactComponent as Logo } from "../../assets/images/logo.svg";
import {
  getAllIdeasRoute,
  getNewIdeaRoute,
  getSignInRoute,
  getSignOutRoute,
  getSignUpRoute,
} from "../../lib/routes";
import { trpc } from "../../lib/trpc";
import { LeftMenu } from "../LeftMenu";
import { Button } from "../Button";
import css from "./index.module.scss";
import { useMe } from "../../lib/ctx";
export const layoutContentElRef = createRef<HTMLDivElement>();

export const Layout = () => {
  const me = useMe();
  console.log("Layout re-rendered, me:", me);

  return (
    <div className={css.layout}>
      <div className={css.navigation}>
        <Logo className={css.logo} />
        <ul className={css.menu}>
          {me ? (
            <></>
          ) : (
            <>
              <li className={css.item}>
                <Link to={getSignUpRoute()}>
                  <Button variant="blue">Регистрация</Button>{" "}
                  {/* Белая кнопка с синим краем */}
                </Link>
              </li>
              <li className={css.item}>
                <Link to={getSignInRoute()}>
                  <Button variant="white-with-blue-border">Логин</Button>{" "}
                  {/* Синяя кнопка */}
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
      <div className={css.mainContent}>
        {me && <LeftMenu />}
        <div className={css.content} ref={layoutContentElRef}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};
>>>>>>> d7d1fffabf09f567df420b0e3df5ed632c29940c
