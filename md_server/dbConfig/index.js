const mysql2 = require("mysql2");

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

exports.db = promisePool;
