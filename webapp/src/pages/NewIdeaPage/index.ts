import { Input } from '../../components/Input'
import { Segment } from '../../components/Segment'
import { Textarea } from '../../components/Textarea'
import { trpc } from '../../lib/trpc'

export const NewIdeaPage = () => {
  const createIdea = trpc.createIdea.useMutation()
  const formik = useFormik({
    initialValues: {
      name: '',
        text: z.string().min(100, 'Text should be at least 100 characters long'),
      })
    ),
    onSubmit: async (values) => {
      await createIdea.mutateAsync(values)
    },
  })