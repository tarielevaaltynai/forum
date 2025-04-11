import { Link } from "react-router-dom";
import {
  getAllIdeasRoute,
  getNewIdeaRoute,
  getEditProfileRoute,
  getSignOutRoute,
  getMyIdeasRoute,
  getLikedIdeasRoute,
} from "../../lib/routes";
import { useMe } from "../../lib/ctx";
import css from "./index.module.scss";
import avatar from "../../assets/images/user.png";
import { getAvatarUrl } from "@forum_project/shared/src/cloudinary";
import "@fortawesome/fontawesome-free/css/all.min.css";

export const LeftMenu = () => {
  const me = useMe();

  if (!me) {
    return null;
  }

  return (
    <div className={css.sidebar}>
      <div className={css.profile}>
        <img
          alt="Profile picture"
          className="rounded-full mx-auto"
          height="100"
          src={getAvatarUrl(me.avatar, "small") || avatar}
          width="100"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = avatar;
          }}
        />
        <h2>{me.nick}</h2>
      </div>

      <nav>
        <ul className={css.menu}>
          <li className={css.item}>
            <Link className={css.link} to={getAllIdeasRoute()}>
              <i className="fas fa-home mr-2"></i>
              Главная страница
            </Link>
          </li>
          <li className={css.item}>
            <Link className={css.link} to={getNewIdeaRoute()}>
              <i className="fas fa-plus-circle mr-2"></i>
              Создать обсуждение
            </Link>
          </li>

          <li className={css.item}>
            <Link to={getMyIdeasRoute()}>
              <i className="fas fa-comments mr-2"></i>
              Мои обсуждения
            </Link>
          </li>

          <li className={css.item}>
            <Link to={getLikedIdeasRoute()}>
              <i className="fas fa-heart mr-2"></i>
              Понравившиеся обсуждения
            </Link>
          </li>

          <li className={css.item}>
            <Link className={css.link} to={getEditProfileRoute()}>
              <i className="fas fa-user-edit mr-2"></i>
              Профиль
            </Link>
          </li>
          <li className={css.item}>
            <Link to={getSignOutRoute()}>
              <i className="fas fa-sign-out-alt mr-2"></i>
              Выйти({me.nick})
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};
