/*import { Link } from 'react-router-dom';
import { getAllIdeasRoute, getNewIdeaRoute } from '../../lib/routes';
import { trpc } from '../../lib/trpc';
import css from './index.module.scss';

export const LeftMenu = () => {
  const { data, isLoading, isError } = trpc.getMe.useQuery();

  if (isLoading) {
    // Можно добавить анимацию загрузки или просто вернуть "Loading..."
    return <div className={css.loading}>Loading...</div>;
  }

  if (isError || !data?.me) {
    // Возвращаем null или компонент, если ошибка или нет данных
    return null;
  }

  return (
    <div className={css.sidebar}>
      <div className={css.logo}>Ideas</div>
      <ul className={css.menu}>
        <li className={css.item}>
          <Link className={css.link} to={getAllIdeasRoute()}>
            All Ideas
          </Link>
        </li>
        <li className={css.item}>
          <Link className={css.link} to={getNewIdeaRoute()}>
            New Idea
          </Link>
        </li>
      </ul>
    </div>
  );
};
*/

import { Link } from 'react-router-dom';
import { getAllIdeasRoute, getNewIdeaRoute } from '../../lib/routes';
import { trpc } from '../../lib/trpc';
import css from './index.module.scss';

export const LeftMenu = () => {
  const { data, isLoading, isError } = trpc.getMe.useQuery();

  if (isLoading) {
    return <div className={css.loading}>Loading...</div>;
  }

  if (isError || !data?.me) {
    return null;
  }

  return (
    <div className={css.sidebar}>
      <ul className={css.menu}>
        <li className={css.item}>
          <Link className={css.link} to={getAllIdeasRoute()}>
            <i className="fas fa-lightbulb mr-3"></i>
            Главная страница
          </Link>
        </li>
        <li className={css.item}>
          <Link className={css.link} to={getNewIdeaRoute()}>
            <i className="fas fa-plus-circle mr-3"></i>
            Создать обсуждение
          </Link>
        </li>
      </ul>
    </div>
  );
};
