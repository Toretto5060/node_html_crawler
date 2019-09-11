let http = require("http"); //http 请求
let qs = require("querystring");
let fs = require("fs");
let iconv = require("iconv-lite");
let Excel = require("exceljs");
let workbook = new Excel.Workbook();
// 基本的创建信息
workbook.creator = "toretto";  //作者
workbook.lastModifiedBy = "toretto";  //最后一次保存者
workbook.created = new Date();  // 创建日期
workbook.modified = new Date(); // 修改日奇
workbook.lastPrinted = new Date(); //最后一次打印时间
let worksheet  =  workbook.addWorksheet('Sheet1');
let fistPost = true;  //第一次请求带table。其它不需要
let fistWrite = true;
let pageAllNums = 1;  // 总页数
let titleList = [];   // 处理过的表格头数据

let startData = "2019-09-09";
let endData = "2019-09-16";
let keywords = "公司"


function iGetInnerText(testStr) {
  let resultStr = testStr.replace(/\s/g,""); //去除所有空格
  resultStr = testStr.replace(/&nbsp;/ig, ""); //去除nbsp
  return resultStr;
}
let postObj = {
  'yzm': 'C2q6',
  'ft':'',
  'ktrqks': startData,
  'ktrqjs': endData,
  'spc':'',
  'yg':'',
  'bg':encodeURI(keywords),
  'ah':'',
  'pagesnum':1
}
request('http://www.hshfy.sh.cn/shfy/gweb2017/ktgg_search_content.jsp',postObj,thisData);

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


function LoopExecution(){
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
    for (let j = 0; j < line.length; j++) {
      let lineArr = []
      let eachLine = line[j].split('</TD>');
      let newEachLine = ""

      for (let k = 0; k < eachLine.length; k++) {
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
        if (newEachLine != "") {
          lineArr.push(newEachLine);
        }
      }
      if (lineArr.length > 1) {
        contDataList.push(lineArr)
      }
      fistPost = false;
    }
  }
  dealWithData(contDataList)
}

/***
 * 处理表格数据
 * **/
function dealWithData(data) {
  console.log(data)
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
  if (fistWrite) {
    worksheet.columns = titleDataList;
    fistWrite = false;
  }


  for (let x = 0; x < data.length; x++) {
    let obj = {}
    for (let y = 0; y < data[x].length; y++) {
      obj[titleList[y]] = data[x][y]
    }
    worksheet.addRow(obj);
  }
  // console.log(contNewDataList)
  creatExcel();
}

/***
 * 写入数据
 * **/
function creatExcel() {
  // worksheet.columns = titleDataList;
  // worksheet.addRow(obj);

  worksheet.views = [{
    state: 'frozen',
    xSplit: 0,
    ySplit: 1,
    topLeftCell: 'A2',  //距离最上方
    activeCell: 'A2'    // 选中框位置
  }];
  let rowNum = Number(worksheet.rowCount);  //获取行数
  let cellNum = Number(worksheet.columnCount);  //获取列数
  let cellType = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];

  for (let i = 1; i < rowNum + 1; i++) {  // 所有行表格定义
    worksheet.getRow(i).alignment = {  // 对齐方式
      vertical: 'middle',
      horizontal: 'center'
    }

    if (i == 1) {
      worksheet.getRow(i).font = {  // 首行字体
        size: 9,
        bold: true,
        name: '宋体'
      }
    }
    if (i > 1) {
      worksheet.getRow(i).font = {  // 除首行字体其他所有字体设置
        size: 10,
        name: '宋体'
      }
    }
  }
  for (let j = 0; j < cellNum; j++) {  // 每个单元格
    for (let x = 0; x < rowNum; x++) {
      if (x == 0) {     // 设置第一行有值的背景色
        worksheet.getCell(cellType[j] + (x + 1)).fill = {  // 填充
          type: 'pattern',
          pattern: 'solid',
          fgColor: {argb: 'FFF3F3F4'},
          bgColor: {argb: 'FFFF0000'},
        };
      }
      if (x > 0) {  //设置除第一行，每一个单元格的边框
        worksheet.getCell(cellType[j] + (x + 1)).border = {
          top: {style: 'thin'},
          left: {style: 'thin'},
          bottom: {style: 'thin'},
          right: {style: 'thin'}
        };
      }
    }
    if (j == (cellNum - 1)) {  // 设置第一行最后一个单元格又边框
      worksheet.getCell(cellType[j] + "1").border = {
        right: {style: 'thin'}
      };
    }
  }
  /***
   * 写入数据
   * **/
  let star = startData.split('-');
  let end = endData.split('-')

  let fileName = star[1]+'.'+star[2]+"-"+ end[1]+'.'+end[2] + "被告数据"
  workbook.xlsx.writeFile(fileName+".xlsx").then(function () {
    console.log("第" +postObj.pagesnum+"页数据导入完成,共"+pageAllNums+"页数据");
    LoopExecution();
  });
}


