import { Link } from 'react-router-dom';
import { getAllIdeasRoute, getNewIdeaRoute, getEditProfileRoute, getSignOutRoute } from '../../lib/routes';
import { useMe } from '../../lib/ctx'; // Импорт контекста
import css from './index.module.scss';
import avatar from '../../assets/images/user.png'; // Это можно оставить как запасной вариант
import { getAvatarUrl } from '@forum_project/shared/src/cloudinary'; // Для получения URL аватара
import '@fortawesome/fontawesome-free/css/all.min.css';

export const LeftMenu = () => {
  const me = useMe(); // Получение данных о пользователе из контекста

  if (!me) {
    return null; // Возвращаем null, если нет данных о пользователе
  }

  return (
    <div className={css.sidebar}>
      <div className={css.profile}>
        <img
          alt="Profile picture of the user"
          className="rounded-full mx-auto"
          height="100"
          src={getAvatarUrl(me.avatar, 'small') || avatar} // Здесь мы получаем URL аватара пользователя
          width="100"
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
