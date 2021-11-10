import {
  createReducer,
  createAsyncThunk,
  combineReducers,
} from "@reduxjs/toolkit";
import { namespace, merge, selector, cs } from "../utils";
import { RootState } from "./index";
import api from "./api";

export type Article = {
  id: number;
  title: string;
  body: string;
  userId: number;
  user: User;
  tags: { id: number; name: string }[];
};

export type User = {
  id: number;
  name: string;
  username: string;
};

const listInitialState = {
  items: [] as Article[],
  total: 0,
  isLoading: false,
  error: "",
  page: 1,
  perPage: 10,
};

const currentInitialState = {
  article: undefined as Article | undefined,
  isLoading: false,
  error: "",
};

const ns = namespace("articles");

const select = selector((s: RootState) => s.articles);
const selectList = select.refine((s) => s.list);
const selectCurrent = select.refine((s) => s.current);

const self = {
  select,
  selectList,
  selectCurrent,

  totalPages: selectList((s) => Math.max(1, Math.ceil(s.total / s.perPage))),

  fetchArticles: createAsyncThunk(
    ns("fetchArticles"),
    api.articles.list.bind(api.articles),
    {
      condition: () => {
        // stupid way for universal SSR
        const win = window as any;
        const ok = !win.SSR;
        win.SSR = undefined;
        return ok;
      },
    }
  ),

  fetchArticle: createAsyncThunk(
    ns("fetchArticle"),
    api.articles.get.bind(api.articles),
    {
      condition: (id, { getState }) =>
        selectCurrent()(getState() as RootState).article?.id !== id,
    }
  ),

  createArticle: createAsyncThunk(
    ns("createArticle"),
    api.articles.create.bind(api.articles)
  ),

  editArticle: createAsyncThunk(
    ns("editArticle"),
    api.articles.edit.bind(api.articles)
  ),

  deleteArticle: createAsyncThunk(
    ns("deleteArticle"),
    api.articles.delete.bind(api.articles)
  ),
};

export default self;

export const list = createReducer(listInitialState, (builder) => {
  builder.addCase(
    self.fetchArticles.pending,
    cs(() =>
      merge({
        isLoading: true,
      })
    )
  );
  builder.addCase(
    self.fetchArticles.fulfilled,
    cs(({ items, page, perPage, total }) =>
      merge({
        isLoading: false,
        error: "",
        items,
        page,
        perPage,
        total,
      })
    )
  );
  builder.addCase(
    self.fetchArticles.rejected,
    cs((_, action) =>
      merge({
        isLoading: false,
        error: action.error.message,
      })
    )
  );
});

export const current = createReducer(currentInitialState, (builder) => {
  builder.addCase(
    self.fetchArticle.pending,
    cs(() =>
      merge({
        article: undefined,
        isLoading: true,
      })
    )
  );

  builder.addCase(
    self.fetchArticle.fulfilled,
    cs((article) =>
      merge({
        article,
        isLoading: false,
        error: "",
      })
    )
  );

  [self.editArticle.pending, self.deleteArticle.pending].forEach((a) =>
    builder.addCase(a, merge({ isLoading: true }))
  );

  [self.editArticle.fulfilled, self.deleteArticle.fulfilled].forEach((a) =>
    builder.addCase(a, merge({ isLoading: false, error: "" }))
  );

  [
    self.fetchArticle.rejected,
    self.editArticle.rejected,
    self.deleteArticle.rejected,
  ].forEach((a) =>
    builder.addCase(
      a,
      cs((_, action) =>
        merge({ isLoading: false /*error: action.error.message*/ })
      )
    )
  );
});

export const reducer = combineReducers({
  list,
  current,
});
