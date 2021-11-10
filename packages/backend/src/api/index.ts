import express from "express";
import { ValidationError } from "yup";
import createAuth from "./auth";
import createPosts from "./posts";

const createApi = ({ jwtSecret }) => {
  const api = express.Router();
  const [authRouter, auth] = createAuth({ jwtSecret });

  api.use(authRouter);
  api.use(createPosts({ auth }));

  api.use((err, req, res, next) => {
    if (err instanceof ValidationError) {
      const errors = err.errors.length ? [err] : err.inner;

      res.status(400).json({
        errors: errors.map(({ path, errors }) => ({
          path,
          errors,
        })),
      });
    } else {
      console.error(err);
      res.status(500).send("An error has occurred");
    }
  });

  return api;
};

export default createApi;
