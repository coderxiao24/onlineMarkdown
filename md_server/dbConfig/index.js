const mysql2 = require("mysql2");
const fsp = require("fs").promises;
const path = require("path");
function getDBConfig() {
  return {
    host: "127.0.0.1",
    user: "root",
    port: 3306,
    password: "xkx001124",
    database: "md_project",
    connectionLimit: 1, //创建一个连接池
  };
}

const config = getDBConfig();
const promisePool = mysql2.createPool(config).promise();

setInterval(async () => {
  let oldFiles = await promisePool.query(
    `SELECT * FROM files   
    WHERE update_time < NOW() - INTERVAL 7 DAY   
    AND id != 0`
  );

  oldFiles = oldFiles[0];
  if (oldFiles && oldFiles.length) {
    console.log(`查询到老文件:${JSON.stringify(oldFiles)}
      即将删除
      `);

    oldFiles.forEach(async (item) => {
      try {
        promisePool.query(
          `DELETE FROM files   
          WHERE id = ?`,
          [item.id]
        );
        console.log(`从数据库里删除老文件${item.name}成功`);
      } catch (error) {
        console.log(`从数据库里删除老文件${item.name}失败`, error);
      }
      try {
        await fsp.unlink(
          path.join(path.resolve(__dirname, ".."), `/public${item.url}`)
        );
        console.log(`从public里删除老文件${item.name}成功`);
      } catch (error) {
        console.log(`从public里删除老文件${item.name}失败`, error);
      }
    });
  } else {
    console.log(`未查询到老文件`);
  }
}, 1000 * 60 * 60);

exports.db = promisePool;
