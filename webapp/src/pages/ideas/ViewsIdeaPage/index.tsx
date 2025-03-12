import { trpc } from '../../../lib/trpc';
import { useParams } from 'react-router-dom';
import { Segment } from '../../../components/Segment'
import { getEditIdeaRoute, type ViewIdeaRouteParams } from '../../../lib/routes';
import format from 'date-fns/format'
import { LinkButton } from '../../../components/Button'
import css from './index.module.scss'
import { withPageWrapper } from '../../../lib/pageWrapper'


export const ViewsIdeaPage = withPageWrapper({
  useQuery: () => {
    const { someNick } = useParams() as ViewIdeaRouteParams
    console.log('someNick:', someNick)
    return trpc.getIdea.useQuery({
     someNick,
     
    })
  },
  setProps: ({ queryResult, checkExists, ctx }) => ({
    idea: checkExists(queryResult.data.idea, 'Обсуждение не найдено'),

    me: ctx.me,
  }),
})(({ idea, me }) => (
<Segment title={idea.name} description={idea.description}>
  <div className={css.createdAt}>Создано: {format(idea.createdAt, 'yyyy-MM-dd')}</div>
  
  <div className={css.author}>
    Автор: {idea.author.nick}
    {idea.author.name ? ` (${idea.author.name})` : ''}
  </div>
  
  <div className={css.text} dangerouslySetInnerHTML={{ __html: idea.text }} />
  
  {me?.id === idea.authorId && (
    <div className={css.editButton}>
      <LinkButton to={getEditIdeaRoute({ someNick: idea.nick })}>Редактировать</LinkButton>
    </div>
  )}
</Segment>
))