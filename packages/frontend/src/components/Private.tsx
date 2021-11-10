import { useSelector } from "../app";
import Auth from "../app/auth";
import { createPrivateComponent } from "./misc";

export default createPrivateComponent(() => ({
  isAuthenticated: useSelector(Auth.isAuthenticated),
  loginPath: "/login",
}));
