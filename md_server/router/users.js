var Router = require("koa-router");
var router = new Router();
const { db } = require("../dbConfig/index");

router.get("/login", async (ctx) => {
  let users = await db.query("select * from users where id=?", [
    ctx.request.query.user_id,
  ]);
  users = users[0];

  if (users && users.length) {
    let files = await db.query("select * from files where user_id = ?", [
      ctx.request.query.user_id,
    ]);

    ctx.body = {
      ok: 1,
      message: "登录成功1",
      user: { ...users[0], files: files[0] },
    };
  } else {
    await db.query("INSERT INTO `users`(`id`) VALUES (?)", [
      ctx.request.query.user_id,
    ]);
    ctx.body = {
      ok: 1,
      message: "登录成功2",
      user: { id: ctx.request.query.user_id, files: [] },
    };
  }
});

module.exports = router;
