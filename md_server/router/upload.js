var Router = require("koa-router");
var router = new Router();
const multer = require("@koa/multer");
const { db } = require("../dbConfig/index");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    file.originalname = Buffer.from(file.originalname, "latin1").toString(
      "utf8"
    );
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/", upload.single("file"), async (ctx) => {
  await db.query("INSERT INTO `files`(`name`,`url`,`user_id`) VALUES (?,?,?)", [
    ctx.file.originalname,
    `/uploads/${ctx.file.filename}`,
    ctx.request.body.user_id,
  ]);

  ctx.body = {
    ok: 1,
    message: "上传成功",
    url: `/uploads/${ctx.file.filename}`,
  };
});

module.exports = router;
