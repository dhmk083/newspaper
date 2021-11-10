import express from "express";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/express";
import { users } from "./models";

const createAuth = ({ jwtSecret }) => {
  const auth = (req, res, next) => {
    try {
      const payload = req.cookies.tokenPayload;
      const signature = req.headers.authorization.split(" ")[1];
      const token = `${payload}.${signature}`;
      const { id } = jwt.verify(token, jwtSecret);
      res.locals.userId = id;
      next();
    } catch (e) {
      return res.status(401).header("WWW-Authenticate", "Bearer").send();
    }
  };

  const router = express.Router();

  router.post(
    "/login/",
    asyncHandler(async (req, res) => {
      const { username, password } = req.body;
      const user = await users.getByUsername(username);
      const token = jwt.sign({ id: user.id }, jwtSecret);
      const [header, payload, signature] = token.split(".");

      if (user && password === "123") {
        res
          .header("Access-Control-Expose-Headers", "X-Auth-Token")
          .header("X-Auth-Token", signature)
          .cookie("tokenPayload", `${header}.${payload}`, {
            httpOnly: true,
            secure: true,
          })
          .json(user);
      } else res.status(401).send();
    })
  );

  return [router, auth];
};

export default createAuth;
