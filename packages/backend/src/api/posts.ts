import express from "express";
import * as yup from "yup";
import { asyncHandler, cache } from "../utils/express";
import { posts } from "./models";

const createPosts = ({ auth }) => {
  const router = express.Router();

  router.get(
    "/posts/",
    cache,
    asyncHandler(async (req, res) => {
      const query = yup
        .object({
          page: yup.number().required().positive().integer().default(1),
          perPage: yup
            .number()
            .required()
            .positive()
            .integer()
            .min(10)
            .max(100)
            .default(10),
        })
        .validateSync(req.query);

      const data = await posts.list(query);
      res.json(data);
    })
  );

  router.post(
    "/posts/",
    auth,
    asyncHandler(async (req, res) => {
      const { userId } = res.locals;
      const id = await posts.save({ ...req.body, userId });
      res.json({ id });
    })
  );

  router.get(
    "/posts/:id",
    cache,
    asyncHandler(async (req, res) => {
      const data = await posts.get(req.params.id);
      res.status(data ? 200 : 404).json(data);
    })
  );

  router.put(
    "/posts/:id",
    auth,
    asyncHandler(async (req, res) => {
      const post = await posts.get(req.params.id);
      const { userId } = res.locals;
      if (!post) return res.status(404).send();
      if (post.userId !== userId)
        return res.status(403).json("Cannot edit other's post");

      await posts.save({ ...post, ...req.body });
      res.send();
    })
  );

  router.delete(
    "/posts/:id",
    auth,
    asyncHandler(async (req, res) => {
      const post = await posts.get(req.params.id);
      if (!post) return res.status(404).send();
      const { userId } = res.locals;
      if (post.userId !== userId) return res.status(403).send();

      await posts.delete(req.params.id);
      return res.send();
    })
  );

  return router;
};

export default createPosts;
