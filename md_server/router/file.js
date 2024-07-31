var Router = require("koa-router");
var router = new Router();
const { db } = require("../dbConfig/index");

const fs = require("fs");
const fsp = require("fs").promises;
const path = require("path");

router.get("/", async (ctx) => {
  let file = await db.query("select * from files where id=?", [
    ctx.request.query.id,
  ]);

  file = file[0];

  if (file && file.length) {
    const rs = fs.createReadStream(
      path.join(path.resolve(__dirname, ".."), `/public${file[0].url}`),
      "utf-8"
    );
    let value = "";

    try {
      await new Promise((resolve, reject) => {
        rs.on("data", function (chunk) {
          value += chunk;
        });
        rs.on("end", function () {
          resolve();
        });
        rs.on("error", function (err) {
          reject();
        });
      });

      ctx.body = {
        ok: 1,
        message: "查询成功",
        value,
      };
    } catch (error) {
      ctx.body = {
        ok: 0,
        message: error,
      };
    }
  } else {
    ctx.body = {
      ok: 0,
      message: "未找到文件",
    };
  }
});

router.post("/", async (ctx) => {
  let file = await db.query("select * from files where id=?", [
    ctx.request.body.id,
  ]);
  file = file[0];

  console.log(file);

  if (file && file.length) {
    await fsp.writeFile(
      path.join(path.resolve(__dirname, ".."), `/public${file[0].url}`),
      ctx.request.body.value
    );

    ctx.body = {
      ok: 1,
      message: "写入成功",
    };
  } else {
    ctx.body = {
      ok: 0,
      message: "未找到文件",
    };
  }
});

router.get("/export/:id", async (ctx) => {
  let file = await db.query("select * from files where id=?", [ctx.params.id]);
  file = file[0];

  if (file && file.length) {
    const fileStream = fs.createReadStream(
      path.join(path.resolve(__dirname, ".."), `/public${file[0].url}`)
    );

    // 将文件流写入响应中
    ctx.body = fileStream;

    // 可以监听文件流的错误事件
    fileStream.on("error", (err) => {
      ctx.status = 500;
      ctx.body = {
        ok: 0,
        message: "网络错误",
      };
    });
  } else {
    ctx.body = {
      ok: 0,
      message: "未找到文件",
    };
  }
});
module.exports = router;
