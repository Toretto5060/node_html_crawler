let http = require("http"); //http 请求
let qs = require("querystring");
let cheerio = require("cheerio");
let fs = require("fs");
let iconv = require("iconv-lite");
let excel = require('node-xlsx');  //基于Node.js将数据生成导出excel文件，生成文件格式为xlsx；

let dataArr = [];  // excel格式数据
let fistPost = true;  //第一次请求带table。其它不需要
let pageAllNums = 1;  // 总页数


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
      // 'Content-Length': '76',
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
  'yzm': 'C2q6',
  'ft':'',
  'ktrqks': '2019-08-27',
  'ktrqjs': '2019-09-27',
  'spc':'',
  'yg':'',
  'bg':'%E5%85%AC%E5%8F%B8',
  'ah':'',
  'pagesnum':1
}
request('http://www.hshfy.sh.cn/shfy/gweb2017/ktgg_search_content.jsp',obj,thisData);

let timer = setInterval(()=>{
  if (obj.pagesnum < (pageAllNums - 633)) {
    obj.pagesnum += 1;
    request('http://www.hshfy.sh.cn/shfy/gweb2017/ktgg_search_content.jsp',obj,thisData);
  } else {
    console.log(dataArr);
    /***
     * 生成表格
     * **/
    let excelData = dataArr
    const options = {'!cols': [{ wch: 6 }, { wch: 7 }, { wch: 10 }, { wch: 50 } ]};
    var buffer = excel.build([{name:"sheet1",data:excelData}],options);
    fs.writeFile('./resut.xlsx', buffer, function (err) {
      if (err){
        console.log(err);
        return;
      }
      console.log('excel已下载');
    });
    clearInterval(timer);
    timer = null;
  }
},3000)







function iGetInnerText(testStr) {
  let resultStr = testStr.replace(/\s/g,""); //去除所有空格
  resultStr = testStr.replace(/&nbsp;/ig, ""); //去除nbsp
  return resultStr;
}



function thisData(data) {
  if (fistPost) {  //首次加载获取总页数
    let reg = /(<strong>)+(.*?)(<\/strong>)+/
    let pageNum = Math.ceil(Number(reg.exec(data)[2]) / 15);
    pageAllNums = pageNum;
  }
  let tableCont = data.split('<TBODY>')[1].split('</TBODY>')[0];
  let line = tableCont.split('</TR>');
  /***
   * 处理截取丢失字符及获取table数据
   * ***/
  for (let i in line) {
    line[i] += "</TR>"
  }
  if (line.length > 2 && line[2].indexOf('暂时') == -1) {
    for (let j in line) {
      let eachLine = line[j].split('</TD>');
      let lineArr = []
      for (let k in eachLine) {
        /***
         * 第一次请求带table头，其它不要
         * ***/
        let newEachLine = ""
        if (fistPost) {
          eachLine[k] += "</TD>"
          let reg = /(<.+?>)+(.*?)(<\/.+?>)+/
          let str1 = reg.exec(eachLine[k])     // 截取节点中数据: <div>123</div>
          if (str1[2].indexOf("*")) {
            let regs = /\<.*\>/
            newEachLine = iGetInnerText(str1[2].replace(regs, '',))  // 去除带*的附带节点：<span></span>和去空格去nbsp;
          } else {
            newEachLine = iGetInnerText(str1[2])
          }
        } else {
          if (j > 0) {
            eachLine[k] += "</TD>"
            let reg = /(<.+?>)+(.*?)(<\/.+?>)+/
            let str1 = reg.exec(eachLine[k])     // 截取节点中数据: <div>123</div>
            if (str1[2].indexOf("*")) {
              let regs = /\<.*\>/
              newEachLine = iGetInnerText(str1[2].replace(regs, '',))  // 去除带*的附带节点：<span></span>和去空格去nbsp;
            } else {
              newEachLine = iGetInnerText(str1[2])
            }
          }
        }
        if (newEachLine != "") {
          lineArr.push(newEachLine);
        }
      }
      if (lineArr.length > 1) {
        dataArr.push(lineArr);
      }
    }

    // 暂时持续写入
    let excelData = dataArr
    // const options = {'!cols': [{ wch: 10 }, { wch: 16 }, { wch: 26 }, { wch: 22 }, { wch: 9 }, { wch: 9 }, { wch: 9 }, { wch: 9 }, { wch: 9 }, { wch: 9 }, { wch: 9 } ]};
    var buffer = excel.build([{name:"sheet1",data:excelData}]);
    fs.writeFile('./resut.xlsx', buffer, function (err) {
      if (err){
        console.log(err);
        return;
      }
      // console.log('excel已下载');
    });


    fistPost = false;
    console.log('第'+obj.pagesnum+"页数据写入完毕")
  }







}

// module.exports = request;
