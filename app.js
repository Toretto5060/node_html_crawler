let http = require("http"); //http 请求
let querystring = require("querystring");
let iconv = require("iconv-lite");

function request(path,param,callback) {
  let options = {
    hostname: 'www.hshfy.sh.cn',
    port: 80, //端口号 https默认端口 443， http默认的端口号是80
    path: path,
    method: 'POST',
    headers: {
      'Accept': '*',
      'Accept-Encoding': 'gzip, deflate',
      'Accept-Language':' zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
      'Connection': 'keep-alive',
      'Content-Length': '76',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': 'JSESSIONID=A1E67355E2E30779DBBCB652CB5A21E6-n1',
      'Host': 'www.hshfy.sh.cn',
      'Origin':' http://www.hshfy.sh.cn',
      'Referer': 'http://www.hshfy.sh.cn/shfy/gweb2017/ktgg_search.jsp?zd=splc',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
      'X-Requested-With': 'XMLHttpRequest'
    }
  };

  let req = http.request(options, function (res) {
    var json = ""; //定义json变量来接收服务器传来的数据
    console.log(res.headers);
    //res.on方法监听数据返回这一过程，"data"参数表示数数据接收的过程中，数据是一点点返回回来的，这里的chunk代表着一条条数据
    res.on("data", function (chunk) {
      json += chunk; //json由一条条数据拼接而成
    })
    res.on("end", function () {
      callback(json,'gbk');
    })
  });




  req.on("error", function () {
    console.log('error')
  })
  req.write(querystring.stringify(param)); //post 请求传参
  req.end(); //必须要写
}
let obj = {
  'yzm': 'szwP',
  'ft':'',
  'ktrqks': '2019-08-23',
  'ktrqjs': '2019-09-23',
  'spc':'',
  'yg':'',
  'bg':'',
  'ah':'',
  'pagesnum': 1
}
request('http://www.hshfy.sh.cn/shfy/gweb2017/ktgg_search_content.jsp',obj,thisData)

function thisData(data) {
  console.log(data)
}
// module.exports = request;
