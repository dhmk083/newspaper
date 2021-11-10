import * as RR from "react-router-dom";
import * as F from "formik";
import * as C from "@chakra-ui/react";

export function createPrivateComponent(auth) {
  return function Private({ children }) {
    const { isAuthenticated, loginPath } = auth();
    const location = RR.useLocation();

    return isAuthenticated ? (
      children
    ) : (
      <RR.Navigate to={loginPath} state={{ from: location }} />
    );
  };
}

export const ErrorMessage = ({ name }) => (
  <F.ErrorMessage
    name={name}
    render={(msg) => (
      <C.Alert status="error">
        <C.AlertIcon />
        {msg}
      </C.Alert>
    )}
  />
);
