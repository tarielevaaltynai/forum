/*import css from './index.module.scss'
import { Input } from '../../../components/Input'
import { Segment } from '../../../components/Segment'
import { Alert } from '../../../components/Alert'
import { Textarea } from '../../../components/Textarea'
import { trpc } from '../../../lib/trpc'
import { Button } from '../../../components/Button'
import { FormItems } from '../../../components/FormItems'
import { useForm } from '../../../lib/form'
import { withPageWrapper } from '../../../lib/pageWrapper'
import { zCreateIdeaTrpcInput } from '@forum_project/backend/src/router/ideas/createIdea/input'
export const NewIdeaPage = withPageWrapper({
  authorizedOnly: true,
})(() => {

    const createIdea = trpc.createIdea.useMutation()
    
    const { formik, buttonProps, alertProps } = useForm({
        initialValues: {
          name: '',
          nick: '',
          description: '',
          text: '',
        },
        validationSchema: zCreateIdeaTrpcInput,
        onSubmit: async (values) => {
          await createIdea.mutateAsync(values)
          formik.resetForm()
        },
        successMessage: 'Обсуждение создано',
        showValidationAlert: true,
      })
    
      return (
        <Segment title="Создать обсуждение">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              formik.handleSubmit()
            }}
          >
                <FormItems>
          <Input name="Имя" label="Заголовок" formik={formik} />
          <Input name="Ник" label="Nick" formik={formik} />
          <Input name="Описание" label="Краткое описание" formik={formik} maxWidth={500} />
          <Textarea name="Текст" label="Текст" formik={formik} />
          <Alert {...alertProps} />
          <Button {...buttonProps}>Создать обсуждение</Button>
        </FormItems>
          </form>
        </Segment>
      )
    })*/
      import { Input } from '../../../components/Input'
      import { Segment } from '../../../components/Segment'
      import { Alert } from '../../../components/Alert'
      import { Textarea } from '../../../components/Textarea'
      import { trpc } from '../../../lib/trpc'
      import { Button } from '../../../components/Button'
      import { FormItems } from '../../../components/FormItems'
      import { useForm } from '../../../lib/form'
      import { withPageWrapper } from '../../../lib/pageWrapper'
      import { zCreateIdeaTrpcInput } from '@forum_project/backend/src/router/ideas/createIdea/input'
      import css from './index.module.scss'
      
      export const NewIdeaPage = withPageWrapper({
        authorizedOnly: true,
        title: 'New Idea',
      })(() => {
      
        const createIdea = trpc.createIdea.useMutation()
        
        const { formik, buttonProps, alertProps } = useForm({
          initialValues: {
            name: '',
            nick: '',
            description: '',
            text: '',
          },
          validationSchema: zCreateIdeaTrpcInput,
          onSubmit: async (values) => {
            await createIdea.mutateAsync(values)
            formik.resetForm()
          },
          successMessage: 'Обсуждение создано',
          showValidationAlert: true,
        })
        
        return (
          <Segment title="Создать обсуждение">
            <form onSubmit={formik.handleSubmit}>
              <FormItems>
                <Input name="name" label="Заголовок" formik={formik} />
                <Input name="nick" label="Nick" formik={formik} />
                <Input name="description" label="Краткое описание" formik={formik} maxWidth={500} />
                <Textarea name="text" label="Текст" formik={formik} />
                <Alert {...alertProps} />
                <Button {...buttonProps}>Создать обсуждение</Button>
              </FormItems>
            </form>
          </Segment>
        )
      })
      