const mysql = require("mysql");


function handleMySql(mySqlName,fn){
  let sqlCont={
    host:'47.95.1.44',        // ip
    user:'root',              //用户名
    password:'123456',        //密码
    database:mySqlName //数据库名
  }
  let db = mysql.createConnection(sqlCont);
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
require('./sh_grabOpenCourtSessionData.js'); //法庭信息

