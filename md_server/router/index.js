var Router = require("koa-router");
var router = new Router();
var upload = require("./upload");
var users = require("./users");
var file = require("./file");

router.prefix("/api");

router.use("/upload", upload.routes(), upload.allowedMethods());
router.use("/users", users.routes(), users.allowedMethods());
router.use("/file", file.routes(), file.allowedMethods());

module.exports = router;
