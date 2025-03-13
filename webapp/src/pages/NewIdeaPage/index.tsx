import css from "./index.module.scss";
import { Input } from "../../components/Input";
import { Segment } from "../../components/Segment";
import { Alert } from "../../components/Alert";
import { Textarea } from "../../components/Textarea";
import { trpc } from "../../lib/trpc";
import { Button } from "../../components/Button";
import { FormItems } from "../../components/FormItems";
import { useForm } from "../../lib/form";
import { zCreateIdeaTrpcInput } from "@forum_project/backend/src/router/createIdea/input";
export const NewIdeaPage = () => {
  const [successMessageVisible, setSuccessMessageVisible] = useState(false);
  const [submittingError, setSubmittingError] = useState<string | null>(null);
  const createIdea = trpc.createIdea.useMutation();

  const { formik, buttonProps, alertProps } = useForm({
    initialValues: {
      name: "",
      nick: "",
      description: "",
      text: "",
    },
    validationSchema: zCreateIdeaTrpcInput,
    onSubmit: async (values) => {
      await createIdea.mutateAsync(values);
      formik.resetForm();
    },
    successMessage: "Idea created!",
    showValidationAlert: true,
  });

  return (
    <Segment title="Создать обсуждение">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          formik.handleSubmit();
        }}
      >
        <FormItems>
          <Input name="name" label="Заголовок" formik={formik} />
          <Input name="nick" label="Nick" formik={formik} />
          <Input
            name="description"
            label="Краткое описание"
            formik={formik}
            maxWidth={500}
          />
          <Textarea name="text" label="Текст" formik={formik} />
          <Alert {...alertProps} />
          <Button {...buttonProps}>Create Idea</Button>
        </FormItems>
      </form>
    </Segment>
  );
};
