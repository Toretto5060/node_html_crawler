const express = require("express");
let server = express();
const bodyParser=require("body-parser");
const mysql = require("mysql");
let config = require("./config/index");

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

function handleMySql(mySqlName,fn){  // 数据库方法
  config.sqlCont.database = mySqlName
  let db =  mysql.createConnection(config.sqlCont);
  db.database = mySqlName;
  db.connect(function(error){
    if(error){
      console.log(error);
    }else{
      if( fn ) {
        fn(db);
        db.end();
      }else {
        throw new Error("invalid parameter fn , parameter fn must be callback!!");
      }
    }
  });
}


server.all('*', function(req, res, next) {
  if (req.method == "OPTIONS") {
    res.header({
      "Access-Control-Allow-Origin":"*",
      "Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept,BLOG_TOKEN"
    });
    res.send();
  }else{
    res.header(config.postHeader);
    if (config.postWhiteList.indexOf(req.url) > -1) {
      next();
    }
  }
});


let hostName = 'localhost';
let port = 6090;
server.listen(port,() => {
  console.log(`服务器运行在http://${hostName}:${port}`);
});


module.exports = {
  server,
  handleMySql
};
// require('./module/sh_grabOpenCourtSessionData.js'); // 上海高院开庭信息
require('./port/sh_crawler_post.js'); // 上海高院开庭信息查询接口


