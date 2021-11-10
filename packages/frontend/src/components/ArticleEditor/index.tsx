import React from "react";
import * as C from "@chakra-ui/react";
import * as F from "formik";
import * as yup from "yup";
import ResizeTextarea from "react-textarea-autosize";
import { Article } from "app/articles";
import { ErrorMessage } from "../misc";

type EditableArticle = Pick<Article, "title" | "body" | "tags">;

const requiredMsg = "This field is required.";

const ArticleSchema = yup.object({
  title: yup.string().required(requiredMsg),
  body: yup.string().required(requiredMsg),
  tags: yup.array(yup.string().required(requiredMsg)),
});

const AutoResizeTextarea = (props) => (
  <C.Textarea as={ResizeTextarea} {...props} />
);

export default function ArticleEditor({
  article,
  onSubmit,
  children,
}: {
  article: EditableArticle;
  onSubmit;
  children;
}) {
  const ref = React.useRef<any>();
  Object.assign(window, { ref, yup });
  return (
    <F.Formik
      innerRef={ref}
      initialValues={{ ...article, tags: article.tags.map((t) => t.name) }}
      validationSchema={ArticleSchema}
      onSubmit={onSubmit}
    >
      <F.Form>{children}</F.Form>
    </F.Formik>
  );
}

ArticleEditor.Fields = () => (
  <C.Stack>
    <C.Text>Title</C.Text>
    <ErrorMessage name="title" />
    <F.Field as={C.Input} name="title" />
    <C.Text>Content</C.Text>
    <ErrorMessage name="body" />
    <F.Field as={AutoResizeTextarea} name="body" />
    <C.Text>Tags</C.Text>
    <F.Field name="tags">
      {({ field: { name, value } }) => (
        <F.FieldArray
          name={name}
          render={(arrayHelpers) => (
            <C.Stack align="flex-start">
              {value?.map((_, index) => (
                <C.Stack key={index}>
                  <ErrorMessage name={`${name}.${index}`} />
                  <C.HStack>
                    <F.Field as={C.Input} name={`${name}.${index}`} />
                    <C.Button
                      colorScheme="red"
                      onClick={() => arrayHelpers.remove(index)}
                    >
                      -
                    </C.Button>
                  </C.HStack>
                </C.Stack>
              ))}
              <C.Button
                colorScheme="teal"
                onClick={() => arrayHelpers.push("")}
              >
                +
              </C.Button>
            </C.Stack>
          )}
        />
      )}
    </F.Field>
  </C.Stack>
);
