import React from "react";
import { Link } from "react-router-dom";
import * as C from "@chakra-ui/react";

export default function Paginator({ page, totalPages, getPageUrl }) {
  if (totalPages === 1) return null;

  const makeSkip = () => <C.Text>...</C.Text>;
  const makeLink = (i, props?) => (
    <C.Button as={Link} to={getPageUrl(i)} {...props}>
      {i}
    </C.Button>
  );

  const firstPage = page < 3 ? null : makeLink(1);
  const skipLeft = page < 4 ? null : makeSkip();
  const prevPage = page < 2 ? null : makeLink(page - 1);
  const currPage = makeLink(page, { colorScheme: "blue" });
  const nextPage = page >= totalPages ? null : makeLink(page + 1);
  const skipRight = page >= totalPages - 2 ? null : makeSkip();
  const lastPage = page >= totalPages - 1 ? null : makeLink(totalPages);

  return (
    <C.HStack>
      {firstPage}
      {skipLeft}
      {prevPage}
      {currPage}
      {nextPage}
      {skipRight}
      {lastPage}
    </C.HStack>
  );

  // const elements = [
  //   firstPage,
  //   skipLeft,
  //   prevPage,
  //   currPage,
  //   nextPage,
  //   skipRight,
  //   lastPage,
  // ]

  // return React.createElement(C.HStack, undefined, ...elements)
}
