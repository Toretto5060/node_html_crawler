const express = require("express");
let app = express();
const mysql = require("mysql");
let config = require("./config/index");

function handleMySql(mySqlName,fn){
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

module.exports = {
  handleMySql
};
require('./module/sh_grabOpenCourtSessionData.js'); // 上海高院开庭信息


