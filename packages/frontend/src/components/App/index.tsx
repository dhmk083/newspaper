import React from "react";
import * as RR from "react-router-dom";
import * as C from "@chakra-ui/react";

import logo from "./logo.svg";
import { useSelector } from "../../app";
import Articles from "../Articles";
import Article from "../Article";
import NewArticle from "../NewArticle";
import Login from "../Login";
import MiniProfile from "../MiniProfile";
import Private from "components/Private";

function App() {
  const toast = C.useToast();
  const message = useSelector((s) => s.message);

  React.useEffect(() => {
    message &&
      toast({
        ...message,
        duration: 10000,
        isClosable: true,
      });
  }, [toast, message]);

  return (
    <C.LightMode>
      <C.Stack maxW={960} mx="auto" p={5} pt={0}>
        <C.Box mb={5}>
          <C.Stack
            as="header"
            direction={{ base: "column", md: "row" }}
            align="center"
          >
            <C.HStack>
              <RR.Link to="/">
                <C.Image src={logo} alt="logo" boxSize="80px" />
              </RR.Link>
              <C.Heading as="h1">Mysite</C.Heading>
            </C.HStack>
            <C.Spacer />
            <MiniProfile />
          </C.Stack>
          <hr />
        </C.Box>

        <RR.Routes>
          <RR.Route index element={<Articles />} />
          <RR.Route path="articles">
            <RR.Route path=":id" element={<Article />} />
            <RR.Route
              path="new"
              element={
                <Private>
                  <NewArticle />
                </Private>
              }
            />
          </RR.Route>
          <RR.Route path="/login" element={<Login />} />

          <RR.Route
            path="*"
            element={<C.Heading>404 - Not found :(</C.Heading>}
          />
        </RR.Routes>
      </C.Stack>
    </C.LightMode>
  );
}

// eslint-disable-next-line import/no-anonymous-default-export
export default () => (
  <C.ChakraProvider>
    <App />
  </C.ChakraProvider>
);
