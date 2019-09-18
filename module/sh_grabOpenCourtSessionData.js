const app = require('../app');
const crypto = require('crypto'); //加载md5加密文件
const dataList = require('./variableList');
let http = require("http"); //http 请求
let qs = require("querystring");
let fs = require("fs");
let iconv = require("iconv-lite");

let fistPost = true;  //第一次请求带table。其它不需要
let fistPostError = false;
let todayFistWrite = true;
let pageAllNums = 1;  // 总页数
let titleList = [];   // 处理过的表格头数据

let errorPost = 0;  //  失败请求次数
let errorNum = 0;   //  失败请求循环次数


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

endData = Number(year)+1 + '-' +  '12-31'

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

setInterval(()=>{
  let today = new Date();
  let year=today.getFullYear();
  let month=(today.getMonth()+1<10)?"0"+(today.getMonth()+1):today.getMonth()+1;
  let day=(today.getDate())<10?"0"+today.getDate():today.getDate();
  let hour=(today.getHours())<10?"0"+today.getHours():today.getHours();
  let minute=(today.getMinutes())<10?"0"+today.getMinutes():today.getMinutes();
  var second=(today.getSeconds())<10?"0"+today.getSeconds():today.getSeconds();

  let myddy=today.getDay();//获取存储当前日期
  let weekday=["星期日","星期一","星期二","星期三","星期四","星期五","星期六"];
  let week = weekday[myddy]

  if (week == "星期六" && hour == '00' && minute == "00" && second == "00") {
    console.log('更新时间到')
    startData = year + '-' + month + '-' + day
    let endYear = ""
    let endMonth = ""
    let endDay = day
    if (Number(month) + 6 > 12) {
      endYear = Number(year) + 1
      endMonth = (Number(Number(month) + 6 - 12)) < 10 ? "0" + (Number(Number(month) + 6 - 12)) : (Number(Number(month) + 6 - 12))
      endData = endYear + '-' + endMonth + '-' + endDay
    }
    endData = Number(year)+1 + '-' +  '12-31'
    request('http://www.hshfy.sh.cn/shfy/gweb2017/ktgg_search_content.jsp',postObj,thisData);
  }
},1000);

request('http://www.hshfy.sh.cn/shfy/gweb2017/ktgg_search_content.jsp',postObj,thisData);
let timer = null

function LoopExecution(){
  clearTimeout(timer);
  timer = null;
  timer = setTimeout(()=>{
    if (postObj.pagesnum < pageAllNums ) {
      postObj.pagesnum += 1;
      request('http://www.hshfy.sh.cn/shfy/gweb2017/ktgg_search_content.jsp',postObj,thisData);
    } else {
      clearTimeout(timer);
      timer = null;
      fistPost = true;
      dataList.sh_port.post_sh_gy = false;
      dataList.sh_port.sh_grab_uppdate = false;
      console.log('数据更新完毕')
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
  dataList.sh_port.post_sh_gy = true;
  if (todayFistWrite) {
    console.log("========================== "+ dataList.getNowFormatDate() + " =========================")
  }
  todayFistWrite = false
  if (!fistPostError) {
    console.log('开始爬取高院开庭数据')
  }
  let options = {
    hostname: 'www.hshfy.sh.cn',
    port: 80, //端口号 https默认端口 443， http默认的端口号是80
    path: path,
    method: 'POST',
    headers: {
      "Accept": '*/*',
      "Accept-Encoding": 'gzip, deflate',
      "Accept-Language": 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
      "Connection": 'keep-alive',
      // "Content-Length": '76',
      "Content-Type": 'application/x-www-form-urlencoded',
      "Cookie": 'COLLPCK=2752062497; JSESSIONID=13E074293E102DDBFD4344A4E2D32F6B-n1',
      "Host": 'www.hshfy.sh.cn',
      "Origin": 'http://www.hshfy.sh.cn',
      "Referer": 'http://www.hshfy.sh.cn/shfy/gweb2017/ktgg_search.jsp?COLLCC=2835507212&zd=splc',
      "User-Agent": 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36',
      "X-Requested-With": 'XMLHttpRequest'
    }
  };
  let req = http.request(options, function (res) {
    let data = [];
    let size = 0;
    //res.on方法监听数据返回这一过程，"data"参数表示数数据接收的过程中，数据是一点点返回回来的，这里的chunk代表着一条条数据
    if (res.statusCode == 200) {
      errorPost = 0;
      res.on("data", function (chunk) {
        data.push(chunk);
        size+=chunk.length;
      })
      res.on("end", function () {
        let buf=Buffer.concat(data,size);
        let str=iconv.decode(buf,'gbk');
        callback(str);
        dataList.sh_port.sh_grab_uppdate = true;
      })
    } else {
      console.log('第' + postObj.pagesnum+'页数据请求失败,正在请求下一页');
      LoopExecution()
    }
  });
  fistPostError = true
  req.on("error", function (err) {
    console.log(err)
  })
  req.write(qs.stringify(param)); //post 请求传参
  req.end(); //必须要写
}

// 删除表
function delete_table(callback,data) {
  let sql = "drop table courtData_copy"
  app.handleMySql('sh_grabOpenCourt', (db)=> {
    db.query(sql,(err,rows)=>{
      if (!err) {
        copy_table(callback,data);
      }
    })
  })
}

// 备份表
function copy_table(callback,data) {
  const sql1 = "create table courtData_copy AS select * from courtData";    // 备份表
  const sql2 = "truncate table courtData"  // 截断表
  app.handleMySql('sh_grabOpenCourt', (db)=> {
    db.query(sql1,(err,rows)=>{
      if (err) {
        console.log('备份失败:' + err);
      } else {
        console.log('备份成功')
        app.handleMySql('sh_grabOpenCourt', (db)=> {
          db.query(sql2,(err,rows)=>{
            if (err) {
              console.log('截断失败');
            } else {
              console.log('截断表courtData成功')
              callback(data);
            }
          })
        })
      }
    })
  })
}


/***
 * 截取表格数据
 * **/
function thisData(data) {
  if (fistPost) {  //首次加载获取总页数
    let reg = /(<strong>)+(.*?)(<\/strong>)+/
    let pageNum = Math.ceil(Number(reg.exec(data)[2]) / 15);
    pageAllNums = pageNum;
    app.handleMySql('sh_grabOpenCourt', (db)=> {
      db.query('select count(*) as court from courtData',(error,rows) => {
        if (!error) {
          if (pageAllNums == (rows[0].court) * 15) {
            return;
          }
        }
      })
    })
    let sql = "select count(*) as court from courtData_copy" // 查询是否存在某张表
    app.handleMySql('sh_grabOpenCourt', (db)=> {
      db.query(sql,(err,rows)=>{
        if (err) {
          copy_table(dealData,data);
        } else {
          delete_table(dealData,data);
        }
      })
    })
  } else {
    dealData(data);
  }
}

function dealData(data) {
  let contDataList = [];  //未处理表格数据
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
          } 
          else{
            newEachLine = iGetInnerText(str1[2])
          }
          if(str1[2].indexOf("上午") > -1) {   //将时间转换为时间戳
            newEachLine=Date.parse(iGetInnerText(str1[2]).replace('上午', ' ',).replace('点', ':',).replace('分','')); 
          }
          else if(str1[2].indexOf("下午") > -1) {
            newEachLine=Date.parse(iGetInnerText(str1[2]).replace('下午', ' ',).replace('点', ':',).replace('分',''));
          }
          
        }
        lineArr.push(newEachLine);
      }
      if (lineArr.length > 1) {
        const hash = crypto.createHash('md5');   //将数组转换成字符串，加密存入，便于批量导入判断是否为重复数据
        hash.update(JSON.stringify(lineArr));
        let md5Paw=hash.digest('hex');
        lineArr.push(md5Paw);

        let today = new Date();
        let year=today.getFullYear();
        let month=(today.getMonth()+1<10)?"0"+(today.getMonth()+1):today.getMonth()+1;
        let day=(today.getDate())<10?"0"+today.getDate():today.getDate();
        let nowTime = year + '-' + month + '-' + day;
        // let nowTime = new Date().getTime();
        lineArr.push(nowTime);
        contDataList.push(lineArr);
      }
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

  /***
  *  批量导入
  **/
  let sql = "INSERT IGNORE INTO courtData(`court`,`the_court`,`trial_date`, `case_num`, `cause_action`, `department`, `presiding_judge`, `plaintiff`, `defendant`, `md5`, `set_timestamp`) VALUES ?";    // 批量插入，设置MD5为唯一索引，重复过滤
  app.handleMySql('sh_grabOpenCourt', (db)=> {
    db.query(sql,[data],(err,rows)=>{
      if (err) {
        //TODO 写入失败计入log
        console.log(err);
      }
      // rows.affectedRows   // 更新条数
      // rows.insertId   // 插入起始id
      fistPost = false;
      LoopExecution();
      console.log('第' + postObj.pagesnum+'页数据导入完毕，共'+pageAllNums+'页，共'+pageAllNums*15+'条数据，预计剩余时间：'+ ((pageAllNums-postObj.pagesnum) / 3000 * 60 ).toFixed(2)+ '分钟');
    })
  })

}