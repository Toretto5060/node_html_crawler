let http = require("http"); //http 请求
let qs = require("querystring");
let cheerio = require("cheerio");
let fs = require("fs");
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
    let data = [];
    let size = 0;
    //res.on方法监听数据返回这一过程，"data"参数表示数数据接收的过程中，数据是一点点返回回来的，这里的chunk代表着一条条数据
    res.on("data", function (chunk) {
      // data += chunk;
      data.push(chunk);
      size+=chunk.length;
    })
    res.on("end", function () {
      let buf=Buffer.concat(data,size);
      let str=iconv.decode(buf,'gbk');
      callback(str)
    })
  });

  req.on("error", function () {
    console.log('error')
  })
  req.write(qs.stringify(param)); //post 请求传参
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

  let str = "<!DOCTYPE html>\n" +
    "<html lang=\"en\">\n" +
    "  <head>\n" +
    "    <meta charset=\"utf8\">\n" +
    "    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">\n" +
    "    <meta name=\"viewport\" content=\"width=device-width,initial-scale=1.0\">\n" +
    "    <title>tast</title>\n" +
    "  </head>\n" +
    "  <body>\n" +
    // iconv.decode(data,'gbk') +
    data +
    "  </body>\n" +
    "</html>\n"
  fs.writeFile('index.html',str,'utf8',function (err) {
    console.log(err)
  })
}
// module.exports = request;
