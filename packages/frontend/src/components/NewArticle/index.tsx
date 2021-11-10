import { useNavigate } from "react-router";
import * as C from "@chakra-ui/react";
import { useDispatch } from "app";
import Articles from "app/articles";
import ArticleEditor from "components/ArticleEditor";
import { usePromise } from "utils";

export default function NewArticle() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [{ isPending }, capture] = usePromise();

  return (
    <ArticleEditor
      article={{ title: "", body: "", tags: [] }}
      onSubmit={(values) =>
        capture(
          dispatch(Articles.createArticle(values)).then((action) => {
            navigate(`/articles/${action.payload.id}`);
          })
        )
      }
    >
      <C.Stack>
        <C.HStack>
          <C.Button colorScheme="blue" type="submit" isLoading={isPending}>
            Create
          </C.Button>
          <C.Button onClick={() => navigate(-1)} isDisabled={isPending}>
            Cancel
          </C.Button>
        </C.HStack>
        <hr />
        <ArticleEditor.Fields />
      </C.Stack>
    </ArticleEditor>
  );
}
