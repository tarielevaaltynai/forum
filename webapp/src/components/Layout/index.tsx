
import { createRef } from "react";
import { Link, Outlet } from "react-router-dom";
import {
  getAllIdeasRoute,
  getSignInRoute,
  getSignUpRoute,
} from "../../lib/routes";
import { LeftMenu } from "../LeftMenu";
import { Button } from "../Button";
import css from "./index.module.scss";
import { useMe } from "../../lib/ctx";
import { ThemeToggle, useTheme } from "../Theme";

export const layoutContentElRef = createRef<HTMLDivElement>();

export const Layout = () => {
  const me = useMe();
  const { isDark } = useTheme();

  return (
    <div className={`${css.layout} ${isDark ? "dark" : ""}`}>
      <header className={css.header}>
        <div className={css.headerContent}>
          <Link to={getAllIdeasRoute()} className={css.logo}>
            <span>Beauty</span>&<span>Health</span>
          </Link>

          <nav className={css.nav}>
            {/* Кнопка темы теперь всегда отдельно */}
            <div className={css.themeToggleWrapper}>
              <ThemeToggle />
            </div>

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
