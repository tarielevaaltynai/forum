import { zUpdateIdeaTrpcInput } from '@forum_project/backend/src/router/ideas/updateIdea/input'
import pick from 'lodash/pick'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert } from '../../../components/Alert'
import { Button } from '../../../components/Button'
import { FormItems } from '../../../components/FormItems'
import { Input } from '../../../components/Input'
import { Segment } from '../../../components/Segment'
import { Textarea } from '../../../components/Textarea'
import { useForm } from '../../../lib/form'
import { canEditIdea } from '@forum_project/backend/src/utils/can'

import { getViewIdeaRoute, type EditIdeaRouteParams } from '../../../lib/routes'
import { trpc } from '../../../lib/trpc'
import { withPageWrapper } from '../../../lib/pageWrapper'

export const EditIdeaPage = withPageWrapper({
  authorizedOnly: true,
  useQuery: () => {
    const { someNick } = useParams() as EditIdeaRouteParams
    return trpc.getIdea.useQuery({
      someNick,
    })
  },
  setProps: ({ queryResult, ctx, checkExists, checkAccess }) => {
    const idea = checkExists(queryResult.data.idea, 'Обсуждение не найдено')
   /* checkAccess(ctx.me?.id === idea.authorId, 'Обсуждение может редактировать только автор')*/
    checkAccess(canEditIdea(ctx.me, idea), 'Обсуждение может редактировать только автор')
    return {
      idea,
    }
  },

})(({ idea }) => {
  const navigate = useNavigate()
  const updateIdea = trpc.updateIdea.useMutation()
  const { formik, buttonProps, alertProps } = useForm({
    initialValues: pick(idea, ['name', 'nick', 'description', 'text']),
    validationSchema: zUpdateIdeaTrpcInput.omit({ ideaId: true }),
    onSubmit: async (values) => {
        await updateIdea.mutateAsync({ ideaId: idea.id, ...values })
        navigate(getViewIdeaRoute({ someNick: values.nick }))
    },
    resetOnSuccess: false,
    showValidationAlert: true,
  })

  return (
    <Segment title={`Редактировать: ${idea.nick}`}>
      <form onSubmit={formik.handleSubmit}>
        <FormItems>
          <Input label="Имя" name="name" formik={formik} />
          <Input label="Ник" name="nick" formik={formik} />
          <Input label="Описание" name="description" maxWidth={500} formik={formik} />
          <Textarea label="Текст" name="text" formik={formik} />
          <Alert {...alertProps} />
          <Button {...buttonProps}>Сохранить</Button>
        </FormItems>
      </form>
    </Segment>
  )
})