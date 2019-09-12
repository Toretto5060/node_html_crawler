const app = require('../app');
let Excel = require("exceljs");
let workbook = new Excel.Workbook();
// 基本的创建信息
workbook.creator = "toretto";  //作者
workbook.lastModifiedBy = "toretto";  //最后一次保存者
workbook.created = new Date();  // 创建日期
workbook.modified = new Date(); // 修改日奇
workbook.lastPrinted = new Date(); //最后一次打印时间
let worksheet  =  workbook.addWorksheet('Sheet1');

let startDatas = ""
let endDatas = ""

function formatDate(now) {
  let Datas = new Date(parseInt(now))
  let year=Datas.getFullYear();
  let month=Datas.getMonth()+1> 9 ?Datas.getMonth()+1 : "0" + Number(Datas.getMonth()+1);
  let date=Datas.getDate()> 9 ?Datas.getDate() : "0" + Datas.getDate();
  let hour=Datas.getHours()> 9 ?Datas.getHours() : "0" + Datas.getHours();
  let minute=Datas.getMinutes()>9?Datas.getMinutes():"0" + Datas.getMinutes();
  let amOrpm = ''
  if (hour > 11) {
    amOrpm = '下午'
  } else {
    amOrpm = '上午'
  }
  return year+"-"+month+"-"+date+amOrpm+hour+"点"+minute+"分";
}

app.server.get("/getCourt",(req,res) => {  //获取表总长度
  let allCont = ''
  app.handleMySql('sh_grabOpenCourt',(db) => {
    let sql1 = 'select count(*) as court from courtData'
    let sql = 'select distinct court from courtData'
    db.query(sql1,(error,rows) => {
      if (!error) {
        allCont = rows[0].court
        app.handleMySql('sh_grabOpenCourt',(db) => {
          db.query(sql,
            (error,rows) => {
              if (!error) {
                let court = [];
                for (let i in rows) {
                  if (rows[i].court.indexOf('*') > -1) {
                    rows[i].court = rows[i].court.split('*')[0]
                  }
                  if (court.indexOf(rows[i].court) == -1) {
                    court.push(rows[i].court)
                  }
                }
                res.status(200).send({
                  code:0,
                  letght:court.length,
                  data:{
                    total:allCont,
                    data:court
                  },
                  msg:"查询成功"
                })
              }
            }
          )
        })

      }
    })
  })
})

app.server.post("/court/sh",(req,res)=>{
  startDatas = req.body.startDate
  endDatas = req.body.endDate
  /***
   * 起始时间：startDate
   * 结束时间：endDate
   * 法院：court
   * 审判长：presiding_judge
   * 原告：plaintiff
   * 被告：defendant
   * 案号：case_num
   * **/
  app.handleMySql('sh_grabOpenCourt',(db) => {
    if (!req.body.startDate || !req.body.endDate) {
      if (!req.body.startDate) {
        res.status(200).send({
            code:-1,
            msg:"startDate为必填项"
        })
      } else if (!req.body.endDate) {
        res.status(200).send({
            code:-1,
            msg:"endDate为必填项"
        })
      }
      return;
    }
    let startDate = Date.parse(req.body.startDate + " 00:00");
    let endDate = Date.parse(req.body.endDate + " 23:00");
    let postList = ['court','the_court','trial_date', 'case_num', 'cause_action', 'department', 'presiding_judge', 'plaintiff', 'defendant']
    let sql = ''
    if (req.body.init) {
      sql = 'select * from courtData where trial_date between ? and ? and court like ? and presiding_judge like ? ' +
      'and plaintiff like ? and defendant like ? and case_num like ? limit 30'
    } else {
      sql = 'select * from courtData where trial_date between ? and ? and court like ? and presiding_judge like ? ' +
      'and plaintiff like ? and defendant like ? and case_num like ?'
    }
    db.query(sql,
      [
        startDate,
        endDate,
        "%"+req.body.court+"%",
        "%"+req.body.presiding_judge+"%",
        "%"+req.body.plaintiff+"%",
        "%"+req.body.defendant+"%",
        "%"+req.body.case_num+"%",
      ],
      (error,rows)=>{
        if (!error) {
          let postArr = rows
          let newArr = []
          for (let i=0; i<postArr.length; i++) {
            let newObj = {}
            if (postArr[i].trial_date) {
              postArr[i].trial_date = formatDate(postArr[i].trial_date)
            }
            for (let j=0; j < postList.length; j++) {
              newObj[postList[j]] = postArr[i][postList[j]]
            }
            newArr.push(newObj)
          }

          // 不是第一次查询存入数据库
          if (!req.body.init) {
            let tableTitle = [
              {
                label:'法院',
                prop:'court',
              },{
                label:'法庭',
                prop:'the_court',
              },{
                label:'开庭日期',
                prop:'trial_date',
              },{
                label:'案号',
                prop:'case_num',
              },{
                label:'案由',
                prop:'cause_action',
              },{
                label:'承办部门',
                prop:'department',
              },{
                label:'审判长/主审人',
                prop:'presiding_judge',
              },{
                label:'原告/上诉人',
                prop:'plaintiff',
              },{
                label: '被告/被上诉人',
                prop: 'defendant',
              }
            ]
            /**
             * 写入头部
             */
            let setWidth = [11,16.5,27,22,8.5,8.5,8.5,8.5,8.5];
            let titleList = []
            for (let x in tableTitle) {
              let obj = {
                header: tableTitle[x].label,
                key: tableTitle[x].label,
                width: setWidth[x]
              }
              titleList.push(obj)
            }
            worksheet.columns = titleList
            // 写入表格
            for (let x=0; x<newArr.length; x++) {
              let rowData = []
              for (let y in newArr[x]) {
                rowData.push(newArr[x][y])
              }
              let rowObj = {}
              for (let z in rowData) {
                let attributeName = tableTitle[z].label
                rowObj[attributeName] = rowData[z]
              }
              worksheet.addRow(rowObj)
            }
            creatExcel(req.body.timestamp)
          }


          res.status(200).send({
            code:0,
            letght:newArr.length,
            data:{
              data:newArr,
              url:'/excel/'+ req.body.timestamp+'.xlsx'
            },
            msg:"查询成功"
          });
        } else {
          console.log(error)
        }
    })
  })
})

/***
 * 写入数据
 * **/
function creatExcel(times) {
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

  let star = startDatas.split('-');
  let end = endDatas.split('-')

  let fileName = times + '.xlsx'
  let fpath = './public/excel/'+fileName   //文件存放路径
  workbook.xlsx.writeFile(fpath).then(() => {
    console.log('写入成功')
  });
}
