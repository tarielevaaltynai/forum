import { Alert } from '../Alert'
import { Segment } from '../Segment'

export const ErrorPageComponent = ({
  title = 'Ошибка',
  message = 'Что-то пошло не так',
  children,
}: {
  title?: string
  message?: string
  children?: React.ReactNode
}) => {
  return (
    <Segment title={title}>
      <Alert color="red">{message}</Alert>
      {children}
    </Segment>
  )
}

