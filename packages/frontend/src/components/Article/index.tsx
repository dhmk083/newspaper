import React from "react";
import * as RR from "react-router-dom";
import * as C from "@chakra-ui/react";
import Private from "components/Private";
import Editor from "components/ArticleEditor";
import { useDispatch, useSelector } from "app";
import Articles, { Article } from "app/articles";
import Auth from "app/auth";
import { usePromise } from "utils";

function ConfirmDeleteDialog({ isOpen, onClose }) {
  return (
    <C.AlertDialog
      isOpen={isOpen}
      onClose={() => onClose(false)}
      leastDestructiveRef={React.useRef<any>()}
    >
      <C.AlertDialogOverlay>
        <C.AlertDialogContent>
          <C.AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete article
          </C.AlertDialogHeader>

          <C.AlertDialogBody>
            Are you sure? You can't undo this action afterwards.
          </C.AlertDialogBody>

          <C.AlertDialogFooter>
            <C.HStack>
              <C.Button onClick={() => onClose(false)}>Cancel</C.Button>
              <C.Button colorScheme="red" onClick={() => onClose(true)}>
                Delete
              </C.Button>
            </C.HStack>
          </C.AlertDialogFooter>
        </C.AlertDialogContent>
      </C.AlertDialogOverlay>
    </C.AlertDialog>
  );
}

function ArticleView({ article, isLoading }: { article: Article; isLoading }) {
  const navigate = RR.useNavigate();
  const [isDeleteDialogOpen, deleteDialog] = C.useBoolean();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(Auth.isAuthenticated);

  return (
    <C.Stack>
      {isAuthenticated && (
        <>
          <C.HStack>
            <C.Button as={RR.Link} to="edit" isDisabled={isLoading}>
              Edit
            </C.Button>
            <C.Button
              colorScheme="red"
              onClick={deleteDialog.on}
              isLoading={isLoading}
            >
              Delete
            </C.Button>
          </C.HStack>
          <hr />
        </>
      )}
      <article>
        <C.Heading mb={2}>{article.title}</C.Heading>
        <C.Text>{article.body}</C.Text>
      </article>

      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={async (del) => {
          deleteDialog.off();
          if (del) {
            try {
              await dispatch(Articles.deleteArticle(article.id)).unwrap();
              navigate("/");
            } catch (e) {}
          }
        }}
      />
    </C.Stack>
  );
}

function ArticleEditor({ article }: { article: Article }) {
  const navigate = RR.useNavigate();
  const dispatch = useDispatch();
  const [{ isPending }, capture] = usePromise();

  return (
    <Editor
      article={article}
      onSubmit={(values) =>
        capture(dispatch(Articles.editArticle({ id: article.id, ...values })))
      }
    >
      <C.Stack>
        <C.HStack>
          <C.Button colorScheme="blue" type="submit" isLoading={isPending}>
            Save
          </C.Button>
          <C.Button onClick={() => navigate(-1)} disabled={isPending}>
            Cancel
          </C.Button>
        </C.HStack>
        <hr />
        <Editor.Fields />
      </C.Stack>
    </Editor>
  );
}

export default function ArticlePage() {
  const { id } = RR.useParams();
  const dispatch = useDispatch();
  const { article, isLoading, error } = useSelector(
    Articles.select((x) => x.current)
  );

  React.useEffect(() => {
    dispatch(Articles.fetchArticle(id));
  }, [dispatch, id]);

  if (!isLoading && error)
    return (
      <C.VStack>
        <C.Heading color="red.500">{error}</C.Heading>
      </C.VStack>
    );

  if (!article)
    return (
      <C.VStack>
        <C.Spinner />
      </C.VStack>
    );

  return (
    <RR.Routes>
      <RR.Route
        path="edit"
        element={
          <Private>
            <ArticleEditor article={article} />
          </Private>
        }
      />

      <RR.Route
        index
        element={<ArticleView article={article} isLoading={isLoading} />}
      />
    </RR.Routes>
  );
}
