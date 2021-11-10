import React from "react";
import { Link, useLocation } from "react-router-dom";
import * as C from "@chakra-ui/react";
import { useDispatch, useSelector } from "../../app";
import Articles from "../../app/articles";
import Paginator from "components/Paginator";

const getPageUrl = (i) => `/?page=${i}`;

export default function ArticlesPage() {
  const { search } = useLocation();
  const queryPage = Number(new URLSearchParams(search).get("page")) || 1;
  const dispatch = useDispatch();
  const articles = useSelector(Articles.selectList((s) => s.items));
  const isLoading = useSelector(Articles.selectList((s) => s.isLoading));
  const page = useSelector(Articles.selectList((s) => s.page));
  const totalPages = useSelector(Articles.totalPages);

  React.useEffect(() => {
    dispatch(Articles.fetchArticles({ page: queryPage }));
  }, [dispatch, queryPage]);

  if (isLoading)
    return (
      <C.VStack>
        <C.Spinner />
      </C.VStack>
    );

  return (
    <C.Stack spacing={5} mb={5}>
      <C.Stack spacing={5} divider={<C.StackDivider />}>
        {articles.map((a) => (
          <ArticlePreview key={a.id} article={a} />
        ))}
      </C.Stack>

      <C.VStack>
        <Paginator
          page={page}
          totalPages={totalPages}
          getPageUrl={getPageUrl}
        />
      </C.VStack>
    </C.Stack>
  );
}

function ArticlePreview({ article }) {
  // const author = useSelector(Articles.getAuthor(article.userId));
  const author = article.user;

  return (
    <article>
      <C.Heading>
        <C.Link as={Link} to={`/articles/${article.id}`}>
          {article.title}
        </C.Link>
      </C.Heading>
      {author && (
        <C.Text fontStyle="italic" color="gray.600">
          {author.name}
        </C.Text>
      )}
      <C.HStack>
        {article.tags.map((t) => (
          <C.Tag key={t.id} colorScheme="cyan">
            {t.name}
          </C.Tag>
        ))}
      </C.HStack>
      <C.Text isTruncated>{article.body}</C.Text>
    </article>
  );
}
