import Knex from "knex";
import { table, fk, m2m, createSelect, omitRefs, getFirst } from "../utils/sql";
import * as yup from "yup";

const db = Knex({
  client: "sqlite3",
  connection: { filename: "db.sqlite3" },
  useNullAsDefault: true,
});

const select = createSelect(db);

export const users = {
  table: table("user", [
    "id",
    "name",
    "username",
    { address: fk(table("address", ["city"])) },
  ]),

  getByUsername: (username) =>
    getFirst(
      select(users.table, (q) => q.where(users.table.cols.username, username))
    ),
};

export const posts = (() => {
  const tag = table("tag", ["id", "name"]);
  const postTags = table("postTags", ["postId", "tagId"]);

  const updateSchema = yup.object({
    id: yup.number().required().positive().integer(),
    title: yup.string().required(),
    body: yup.string().required(),
    userId: yup.number().required().positive().integer(),
    tags: yup.array(yup.string().required()).required(),
  });

  const createSchema = updateSchema.omit(["id"]);

  return {
    table: table("post", [
      "id",
      "title",
      "body",
      "userId",
      {
        user: fk(users.table),
        tags: m2m(tag, postTags),
      },
    ]),

    list: async ({ page, perPage }) => {
      const [items, total] = await Promise.all([
        select(posts.table, (q) =>
          q
            .orderBy("id", "desc")
            .limit(perPage)
            .offset((page - 1) * perPage)
        ),
        db(posts.table.tableName)
          .count("* as total")
          .then((r) => r[0].total),
      ]);

      return {
        items,
        total,
        page,
        perPage,
      };
    },

    get: (id) =>
      getFirst(select(posts.table, (q) => q.where(posts.table.cols.id, id))),

    async save(data) {
      const schema = "id" in data ? updateSchema : createSchema;
      const post = schema.validateSync(data) as
        | yup.Asserts<typeof createSchema>
        | yup.Asserts<typeof updateSchema>;

      return db.transaction(async (trx) => {
        async function setTags(postId) {
          await trx(postTags.tableName)
            .where(postTags.cols.postId, postId)
            .delete();

          if (!post.tags.length) return;

          await trx(tag.tableName)
            .insert(post.tags.map((name) => ({ name })))
            .onConflict(tag.cols.name)
            .merge();
          const tags = await createSelect(trx)(tag, (q) =>
            post.tags.reduce((q, t) => q.orWhere(tag.cols.name, "like", t), q)
          );
          await trx(postTags.tableName).insert(
            tags.map((t) => ({ postId, tagId: t.id }))
          );
        }

        const postOwnData = omitRefs(post, posts.table);

        if ("id" in post && post.id) {
          await trx(posts.table.tableName)
            .update(postOwnData)
            .where(posts.table.cols.id, post.id);
          await setTags(post.id);
          return post.id;
        } else {
          const id = (await trx(posts.table.tableName).insert(postOwnData))[0];
          await setTags(id);
          return id;
        }
      });
    },

    delete: (id) =>
      db(posts.table.tableName).where(posts.table.cols.id, id).delete(),
  };
})();
