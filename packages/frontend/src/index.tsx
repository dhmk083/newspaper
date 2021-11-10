import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import "./index.css";
import App from "./components/App";
import reportWebVitals from "./reportWebVitals";
import { createStore } from "app";
import { BrowserRouter } from "react-router-dom";

const win = window as any;
const savedState = win.SSR;

const store = createStore(
  Object.assign(savedState || {}, JSON.parse(localStorage.getItem("store")!))
);

win.getSSR = () => JSON.stringify(store.getState());

const mount = savedState ? ReactDOM.hydrate : ReactDOM.render;

mount(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
