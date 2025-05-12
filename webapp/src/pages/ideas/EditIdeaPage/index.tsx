import { zUpdateIdeaTrpcInput } from "@forum_project/backend/src/router/ideas/updateIdea/input";
import { pick } from "@forum_project/shared/src/pick";
import { useNavigate } from "react-router-dom";
import { Alert } from "../../../components/Alert";
import { Button } from "../../../components/Button";
import { FormItems } from "../../../components/FormItems";
import { Input } from "../../../components/Input";
import { Segment } from "../../../components/Segment";
import { Textarea } from "../../../components/Textarea";
import { useForm } from "../../../lib/form";
import { getEditIdeaRoute, getViewIdeaRoute } from "../../../lib/routes";
import { trpc } from "../../../lib/trpc";
import { UploadsToCloudinary } from "../../../components/UploadsToCloudinary";
import { withPageWrapper } from "../../../lib/pageWrapper";
import { canEditIdea } from "@forum_project/backend/src/utils/can";
import css from "./index.module.scss";
export const EditIdeaPage = withPageWrapper({
  authorizedOnly: true,
  useQuery: () => {
    const { someNick } = getEditIdeaRoute.useParams();
    return trpc.getIdea.useQuery({
      someNick,
    });
  },
  setProps: ({ queryResult, ctx, checkExists, checkAccess }) => {
    const idea = checkExists(queryResult.data.idea, "Обсуждение не найдено");

    checkAccess(
      canEditIdea(ctx.me, idea),
      "An idea can only be edited by the author"
    );
    return {
      idea,
    };
  },
  title: ({ idea }) => `Edit Idea "${idea.name}"`,
})(({ idea }) => {
  const navigate = useNavigate();
  const updateIdea = trpc.updateIdea.useMutation();
  const { formik, buttonProps, alertProps } = useForm({
    initialValues: pick(idea, [
      "name",
      "nick",
      "description",
      "text",
      "images",
    ]),
    validationSchema: zUpdateIdeaTrpcInput.omit({ ideaId: true }),
    onSubmit: async (values) => {
      await updateIdea.mutateAsync({ ideaId: idea.id, ...values });
      navigate(getViewIdeaRoute({ someNick: values.nick }));
    },
    resetOnSuccess: false,
    showValidationAlert: true,
  });

  return (
    <div className={css.container}>
    <Segment title={`Редактировать: ${idea.nick}`}>
      <form onSubmit={formik.handleSubmit}>
        <FormItems>
          <Input label="Имя" name="name" formik={formik} />
          <Input label="Ник" name="nick" formik={formik} />
          <Input label="Описание" name="description" formik={formik} />

          <Textarea label="Текст" name="text" formik={formik} />
          <UploadsToCloudinary
            label="Images"
            name="images"
            type="image"
            preset="preview"
            formik={formik}
          />
          <Alert {...alertProps} />
          <Button {...buttonProps}>Сохранить</Button>
        </FormItems>
      </form>
      </Segment>
    </div>
  );
});
