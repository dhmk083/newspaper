import * as RR from "react-router-dom";
import * as C from "@chakra-ui/react";
import { useDispatch, useSelector } from "app";
import Auth from "app/auth";

export default function MiniProfile() {
  const dispatch = useDispatch();
  const user = useSelector(Auth.me);

  if (user)
    return (
      <C.HStack alignItems="baseline">
        <C.Text>{user.name}</C.Text>
        <C.Box
          borderLeft="1px solid"
          bg="gray.400"
          w="2px"
          alignSelf="stretch"
        />
        <C.Link as={RR.Link} to="/articles/new">
          New Article
        </C.Link>
        <C.Link href="#" role="button" onClick={() => dispatch(Auth.logout())}>
          Logout
        </C.Link>
      </C.HStack>
    );

  return (
    <C.Link as={RR.Link} to="/login">
      Login
    </C.Link>
  );
}
