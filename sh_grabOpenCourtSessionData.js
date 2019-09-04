const app = require('./app');
const crypto = require('crypto'); //加载md5加密文件
let http = require("http"); //http 请求
let qs = require("querystring");
let fs = require("fs");
let iconv = require("iconv-lite");


let fistPost = true;  //第一次请求带table。其它不需要
let fistWrite = true;
let pageAllNums = 1;  // 总页数
let titleList = [];   // 处理过的表格头数据

let errorPost = 0;


/***
 *  获取当前时间
 * ***/

let startData = "";
let endData = "";

// 获取项目启动时间  及半年后时间
let today = new Date();
let year=today.getFullYear();
let month=(today.getMonth()+1<10)?"0"+(today.getMonth()+1):today.getMonth()+1;
let day=(today.getDate())<10?"0"+today.getDate():today.getDate();
startData = year + '-' + month + '-' + day

// let endYear = ""
// let endMonth = ""
// let endDay = day
// if (Number(month) + 6 > 12) {
//   endYear = Number(year) + 1
//   endMonth = (Number(Number(month) + 6 - 12)) < 10 ? "0" + (Number(Number(month) + 6 - 12)) : (Number(Number(month) + 6 - 12))
// } else {
//   endYear = Number(year)
//   endMonth = Number(Number(month) + 6)
// }
endData = Number(year)+1 + '-' +  '12-31'


// setInterval(()=>{
//   let today = new Date();
//   let year=today.getFullYear();
//   let month=(today.getMonth()+1<10)?"0"+(today.getMonth()+1):today.getMonth()+1;
//   let day=(today.getDate())<10?"0"+today.getDate():today.getDate();
//   let hour=(today.getHours())<10?"0"+today.getHours():today.getHours();
//   let minute=(today.getMinutes())<10?"0"+today.getMinutes():today.getMinutes();
//   var second=(today.getSeconds())<10?"0"+today.getSeconds():today.getSeconds();
//
//   let myddy=today.getDay();//获取存储当前日期
//   let weekday=["星期日","星期一","星期二","星期三","星期四","星期五","星期六"];
//   let week = weekday[myddy]
//
//   if (week == "星期六" && hour == '00' && minute == "00" && second == "00") {
//     startData = year + '-' + month + '-' + day
//     let endYear = ""
//     let endMonth = ""
//     let endDay = day
//     if (Number(month) + 6 > 12) {
//       endYear = Number(year) + 1
//       endMonth = (Number(Number(month) + 6 - 12)) < 10 ? "0" + (Number(Number(month) + 6 - 12)) : (Number(Number(month) + 6 - 12))
//       endData = endYear + '-' + endMonth + '-' + endDay
//     }
//     endData = Number(year)+1 + '-' +  '12-31'
//     let timer = setInterval(()=>{
//       clearInterval(timer);
//       timer = null;
//       if (postObj.pagesnum < pageAllNums ) {
//         postObj.pagesnum += 1;
//         request('http://www.hshfy.sh.cn/shfy/gweb2017/ktgg_search_content.jsp',postObj,thisData);
//       } else {
//         clearInterval(timer);
//         timer = null;
//       }
//     },3000);
//
//   }
// },1000);

let postObj = {
  'yzm': 'C2q6',
  'ft':'',
  'ktrqks': startData,
  'ktrqjs': endData,
  'spc':'',
  'yg':'',
  'bg':'',
  'ah':'',
  'pagesnum':1
}
request('http://www.hshfy.sh.cn/shfy/gweb2017/ktgg_search_content.jsp',postObj,thisData);


function LoopExecution(){   // 立即查询当天 -- 半个月后数据
  let timer = setInterval(()=>{
    clearInterval(timer);
    timer = null;
    if (postObj.pagesnum < pageAllNums ) {
      postObj.pagesnum += 1;
      request('http://www.hshfy.sh.cn/shfy/gweb2017/ktgg_search_content.jsp',postObj,thisData);
    } else {
      clearInterval(timer);
      timer = null;
    }
  },3000)
}


function iGetInnerText(testStr) {
  let resultStr = testStr.replace(/\s/g,""); //去除所有空格
  resultStr = testStr.replace(/&nbsp;/ig, ""); //去除nbsp
  return resultStr;
}

/***
 * 请求数据
 * **/
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
    if (res.statusCode == 200) {
      res.on("data", function (chunk) {
        data.push(chunk);
        size+=chunk.length;
      })
      res.on("end", function () {
        let buf=Buffer.concat(data,size);
        let str=iconv.decode(buf,'gbk');
        callback(str)
      })
    } else {
      errorPost += 1;
      if (errorPost < 4) {
        request('http://www.hshfy.sh.cn/shfy/gweb2017/ktgg_search_content.jsp',postObj,thisData);
      } else {
        //TODO 记录请求失败的页数
        errorPost = 0;
        postObj.pagesnum += 1;
        request('http://www.hshfy.sh.cn/shfy/gweb2017/ktgg_search_content.jsp',postObj,thisData);
      }
    }
  });

  req.on("error", function () {
    console.log('error')
  })
  req.write(qs.stringify(param)); //post 请求传参
  req.end(); //必须要写
}



/***
 * 截取表格数据
 * **/
function thisData(data) {
  let contDataList = [];  //未处理表格数据
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
    for (let j = 1; j < line.length; j++) {    // 第一个数组中数组始终为9个空置，所以从1开始
      let lineArr = []
      let eachLine = line[j].split('</TD>');
      let newEachLine = ""
      for (let k = 0; k < eachLine.length-1; k++) {  // 最后一条数据始终为空，故不循环，减1
        /***
         * 获取表头数据
         * ***/
        if (j == 0) {
          let everyTitle = ""
          eachLine[k] += "</TD>"
          let reg = /(<.+?>)+(.*?)(<\/.+?>)+/
          let str1 = reg.exec(eachLine[k])     // 截取节点中数据: <div>123</div>
          if (str1[2].indexOf("*")) {
            let regs = /\<.*\>/
            everyTitle = iGetInnerText(str1[2].replace(regs, '',))  // 去除带*的附带节点：<span></span>和去空格去nbsp;
          } else {
            everyTitle = iGetInnerText(str1[2])
          }
          if (j == 0) {
            if (everyTitle != "") {
              titleList.push(everyTitle)
            }
          }
        } else if (j > 0) {
          eachLine[k] += "</TD>"
          let reg = /(<.+?>)+(.*?)(<\/.+?>)+/
          let str1 = reg.exec(eachLine[k])     // 截取节点中数据: <div>123</div>
          if (str1[2].indexOf("*")) {
            let regs = /\<.*\>/
            newEachLine = iGetInnerText(str1[2].replace(regs, '',));// 去除带*的附带节点：<span></span>和去空格去nbsp;
          } else {
            newEachLine = iGetInnerText(str1[2])
          }
        }
        lineArr.push(newEachLine);
      }
      if (lineArr.length > 1) {
        const hash = crypto.createHash('md5');   //将数组转换成字符串，加密存入，便于批量导入判断是否为重复数据
        hash.update(JSON.stringify(lineArr));
        let md5Paw=hash.digest('hex');
        lineArr.push(md5Paw);
        contDataList.push(lineArr)
      }
      fistPost = false;
    }
  }
  dealWithData(contDataList);
}

/***
 * 处理表格数据
 * **/
function dealWithData(data) {
  /****
   * 处理表头至excel表头格式
   * ***/
  let titleDataList = [];
  let setWidth = [11,16.5,27,22,8.5,8.5,8.5,8.5,8.5]
  for (let o = 0; o < titleList.length; o++) {
    let obj = {
      header: titleList[o],
      key: titleList[o],
      width:setWidth[o]
    }
    titleDataList.push(obj)
  }

  let tableData = ['court','the_court','trial_date','case_num','cause_action','department','presiding_judge','plaintiff','defendant']
  let dataLength = data.length;


  /***
  *  批量导入
  **/

  let sql = "INSERT IGNORE INTO courtData(`court`,`the_court`,`trial_date`, `case_num`, `cause_action`, `department`, `presiding_judge`, `plaintiff`, `defendant`, `md5`) VALUES ?";
  // let sql2 = 'SELECT md5 FROM courtData VALUES ?'

  app.handleMySql('sh_grabOpenCourt',function (db) {
    db.query(sql,[data],(err,rows)=>{
      if (err) {
        //TODO 写入失败计入log
        console.log(err);
      }
      // LoopExecution();
      console.log('第' + postObj.pagesnum+'页数据导入完毕，共'+pageAllNums+'页');
    })
  })







  // for (let x = 0; x < dataLength; x++) {
  //   let obj = {};
  //   for (let y = 0; y < tableData.length; y++) {
  //     if (data[x][y]) {
  //       obj[tableData[y]] = data[x][y]
  //     } else {
  //       obj[tableData[y]] = ""
  //     }
  //   }

    // app.handleMySql('sh_grabOpenCourt',function (db) {
    //   db.query(
    //     'select * from courtData where ' +
    //     'court=? and ' +
    //     'the_court=? and ' +
    //     'trial_date=? and ' +
    //     'case_num=? and ' +
    //     'cause_action=? and ' +
    //     'department=? and ' +
    //     'presiding_judge=? and ' +
    //     'plaintiff=? and ' +
    //     'defendant=? ',
    //     [obj.court,
    //       obj.the_court,
    //       obj.trial_date,
    //       obj.case_num,
    //       obj.cause_action,
    //       obj.department,
    //       obj.presiding_judge,
    //       obj.plaintiff,
    //       obj.defendant
    //     ], (error, rows) => {
    //       if (error) {
    //         console.log(error)
    //       }
    //       if (rows.length < 1) {
            /****
             * 写入
             * **/
          //   app.handleMySql('sh_grabOpenCourt',function (db) {
          //     db.query(
          //       'INSERT INTO courtData SET  ?',
          //       obj,
          //       (error,rows) => {
          //         if(error){
          //           console.log(error);
          //         }else{
          //           console.log('写入成功')
  
          //         }
          //       });
          //   });
          // } else {
          //   console.log('已存在list_id = '+rows[0].list_id+'的记录')
          // }
  //       });
  //   })


  // }

  // }
}


