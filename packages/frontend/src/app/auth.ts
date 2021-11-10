import {
  createAction,
  createAsyncThunk,
  createReducer,
} from "@reduxjs/toolkit";
import { merge, namespace, cs, selector } from "../utils";
import { RootState } from ".";
import api from "./api";
import { User } from "./articles";

const initialState = {
  me: null as User | null,
};

const ns = namespace("auth");

const select = selector((s: RootState) => s.auth);

const self = {
  select,

  login: createAsyncThunk(ns("login"), api.login.bind(api)),

  logout: createAction(ns("logout"), () => {
    api.logout();
    return { payload: undefined };
  }),

  me: select((s) => s.me),
  isAuthenticated: select((s) => !!s.me),

  serialize: select((s) => s),
};

export default self;

// prettier-ignore
export const reducer = createReducer(initialState, (builder) => {
  builder.addCase(self.login.fulfilled, cs((me) => merge({ me })))
  builder.addCase(self.login.rejected, cs(() => merge({ me: null })))
  builder.addCase(self.logout, cs(() => merge({ me: null })))
});
