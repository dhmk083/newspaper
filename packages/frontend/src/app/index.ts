import { useDispatch as _useDispatch, createSelectorHook } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import debounce from "lodash.debounce";

import Auth, { reducer as auth } from "./auth";
import { reducer as articles } from "./articles";
import { reducer as message } from "./message";
import { init } from "./api";

export const createStore = (preloadedState = undefined) => {
  const store = configureStore({
    reducer: {
      auth,
      articles,
      message,
    },
    preloadedState,
  });

  init(() => store.dispatch(Auth.logout()));

  store.subscribe(
    debounce(() => {
      const state = store.getState();
      const serializers = {
        auth: Auth.serialize,
      };
      const serializedState = Object.fromEntries(
        Object.entries(store.getState())
          .filter(([k]) => serializers[k])
          .map(([k]) => [k, serializers[k](state)])
      );
      localStorage.setItem("store", JSON.stringify(serializedState));
    }, 1000)
  );

  return store;
};

type Store = ReturnType<typeof createStore>;

export type RootState = ReturnType<Store["getState"]>;

export const useDispatch = () => _useDispatch<Store["dispatch"]>();
export const useSelector = createSelectorHook<RootState>();
