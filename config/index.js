const sqlCont={              // 数据库相关信息
  host:'47.95.1.44',         // ip
  user:'root',               //用户名
  password:'123456',         //密码
  multipleStatements: true
}

// 请求头相关信息
const postHeader = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept,BLOG_TOKEN",
  "Access-Control-Allow-Methods": "PUT,POST,GET,DELETE,OPTIONS",
  "X-Powered-By": ' 3.2.1',
  "Content-Type": "application/json;charset=utf-8"
}

// 请求白名单
const postWhiteList = ['/court/sh']






module.exports = {
  sqlCont,
  postHeader,
  postWhiteList
}
