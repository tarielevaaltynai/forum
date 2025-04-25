import { Link } from "react-router-dom";
import {
  getAllIdeasRoute,
  getNewIdeaRoute,
  getEditProfileRoute,
  getSignOutRoute,
  getMyIdeasRoute,
  getLikedIdeasRoute,
  getAdminSpecialistRoute,
} from "../../lib/routes";
import { useMe } from "../../lib/ctx";
import css from "./index.module.scss";
import avatar from "../../assets/images/user.png";
import { getAvatarUrl } from "@forum_project/shared/src/cloudinary";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { ThemeProvider } from "../Theme";

export const LeftMenu = () => {
  const me = useMe();
  const hasAllPermission = me?.permissions?.includes("ALL");

  if (!me) {
    return null;
  }

  return (
    <ThemeProvider>
      <div className={css.sidebar}>
        <div className={css.profile}>
          <img
            alt="Profile picture"
            className={css.avatar}
            src={getAvatarUrl(me.avatar, "small") || avatar}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = avatar;
            }}
          />
          <h2 className={css.username}>{me.nick}</h2>
        </div>

        <nav className={css.nav}>
          <ul className={css.menu}>
            <li className={css.item}>
              <Link className={css.link} to={getAllIdeasRoute()}>
                <i className="fas fa-home"></i>
                <span className={css.linkText}>Главная страница</span>
              </Link>
            </li>
            <li className={css.item}>
              <Link className={css.link} to={getNewIdeaRoute()}>
                <i className="fas fa-plus-circle"></i>
                <span className={css.linkText}>Создать обсуждение</span>
              </Link>
            </li>
            <li className={css.item}>
              <Link className={css.link} to={getMyIdeasRoute()}>
                <i className="fas fa-comments"></i>
                <span className={css.linkText}>Мои обсуждения</span>
              </Link>
            </li>
            <li className={css.item}>
              <Link className={css.link} to={getLikedIdeasRoute()}>
                <i className="fas fa-heart"></i>
                <span className={css.linkText}>Понравившиеся</span>
              </Link>
            </li>
            <li className={css.item}>
              <Link className={css.link} to={getEditProfileRoute()}>
                <i className="fas fa-user-edit"></i>
                <span className={css.linkText}>Профиль</span>
              </Link>
            </li>
            <li className={css.item}>
              <Link className={css.link} to={getSignOutRoute()}>
                <i className="fas fa-sign-out-alt"></i>
                <span className={css.linkText}>Выйти</span>
              </Link>
            </li>

            {hasAllPermission && (
              <li className={`${css.item} ${css.adminItem}`}>
                <Link className={css.link} to={getAdminSpecialistRoute()}>
                  <i className="fas fa-user-shield"></i>
                  <span className={css.linkText}>Верификация экспертов</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </ThemeProvider>
  );
};