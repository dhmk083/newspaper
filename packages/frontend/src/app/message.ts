import { createSlice } from "@reduxjs/toolkit";
import { cs, merge } from "../utils";
import Articles from "./articles";

type Message = {
  title: string;
  description: string;
  status: "info" | "warning" | "success" | "error";
};

type MessageAction = Partial<Message> & Pick<Message, "description">;

const initialState = null as Message | null;

const message = (msg) => ({
  title: msg.title || "My Site",
  description: msg.description,
  status: msg.status || "info",
});

const { reducer, actions } = createSlice({
  name: "message",
  initialState,
  reducers: {
    message: cs((msg: MessageAction) => merge(message(msg))),
  },
  extraReducers: (builder) => {
    builder.addCase(Articles.deleteArticle.fulfilled, () =>
      message({ description: "Article deleted!" })
    );

    builder.addCase(Articles.createArticle.fulfilled, () =>
      message({ description: "Article created!" })
    );

    builder.addCase(Articles.editArticle.fulfilled, () =>
      message({ description: "Article edited!" })
    );

    builder.addMatcher(
      (action) => action.error,
      (state, action) => ({
        title: action.error.name || "An error has occurred",
        description: `[${action.type}]: ${
          action.error.message || action.error
        }`,
        status: "error",
      })
    );
  },
});

export { reducer };

const self = {
  ...actions,
  error: (error) => ({ type: "unknown error", error }),
};

export default self;
