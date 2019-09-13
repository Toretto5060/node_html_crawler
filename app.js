const express = require("express");
let server = express();
const bodyParser=require("body-parser");
const mysql = require("mysql");
let config = require("./config/index");
const NodeRSA = require('node-rsa');
const fs = require('fs');
const dataList = require('./module/variableList');



server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(express.static('public'));

function generator() {  // 生成秘钥 私钥/公钥
 var key = new NodeRSA({ b: 512 })
 key.setOptions({ encryptionScheme: 'pkcs1' })
 var privatePem = key.exportKey('pkcs1-private-pem')
 var publicPem = key.exportKey('pkcs1-public-pem')
 fs.writeFile('./pem/public.pem', publicPem, (err) => {
 if (err) throw err
 console.log('公钥已保存！')
 })
 fs.writeFile('./pem/private.pem', privatePem, (err) => {
 if (err) throw err
 console.log('私钥已保存！')
 })
}
// generator();



// TODO 生成密文return出来，其他地方调用
function encrypt(msg) {  // 加密
  var cipher = "";
  fs.readFile('./pem/private.pem', (err, data)=> {
    var key = new NodeRSA(data);
    var cipherText = key.encryptPrivate(msg, 'base64');
    cipher = cipherText;
    console.log(cipher);
  });
  // return cipher;
}


// function decrypt() {  // 解密
//  fs.readFile('./pem/public.pem', function (err, data) {
//  var key = new NodeRSA(data);
//  let rawText = key.decryptPublic('fH1aVCUceJYVvt1tZ7WYc1Dh5dVCd952GY5CX283V/wK2229FLgT9WfRNAPMjbTtwL9ghVeYD4Lsi6yM1t4OqA==', 'utf8');
//  console.log(rawText);
//  });
// }
// //generator();
// //encrypt();
// decrypt();


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
    // if (config.postWhiteList.indexOf(req.url) > -1) {
      next();
    // }
  }
});

// let hostName = 'box.toretto.top';
let hostName = 'http://localhost';
let port = 6090;
server.listen(port,() => {
  console.log(`服务器运行在http://${hostName}:${port}`);
  require('./module/sh_grabOpenCourtSessionData.js'); // 爬取上海高院开庭信息
  require('./port/publicPort.js'); // 公用接口调用
  require('./port/sh_crawler_post.js'); // 上海高院开庭信息查询接口
});


module.exports = {
  server,
  handleMySql,
  encrypt
};


