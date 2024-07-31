const Koa = require("koa");

const path = require("path");
const static = require("koa-static");
const bodyParser = require("koa-bodyparser");

const router = require("./router/index");

const app = new Koa();

// 获取请求体里的参数
app.use(bodyParser());

app.use(static(path.join(__dirname, "public")));

app.use(router.routes()).use(router.allowedMethods());

app.use(function (ctx, next) {
  ctx.body = { ok: 0, message: "404" };
});

app.listen(1125, () => {
  console.log("启动成功");
});
