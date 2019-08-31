var Excel = require("exceljs");

var workbook = new Excel.Workbook();

// 基本的创建信息
workbook.creator = "toretto";  //作者
workbook.lastModifiedBy = "toretto";  //最后一次保存者
workbook.created = new Date();  // 创建日期
workbook.modified = new Date(); // 修改日奇
workbook.lastPrinted = new Date(); //最后一次打印时间

var worksheet  =  workbook.addWorksheet('Sheet1');

worksheet.columns = [
  { header: 'Id', key: 'id'},
  { header: 'Name', key: 'name'},
  { header: 'dob', key: 'dob'}
];


worksheet.addRow({id: 1, name: 'John Doe', dob: new Date(1970,1,1)});

// worksheet.pageSetup = {
//   horizontalCentered = true;
//   showGridLines = false;
// }


worksheet.views = [{state: 'frozen',
                    xSplit: 0,
                    ySplit: 1,
                    topLeftCell: 'A2',  //距离最上方
                    activeCell: 'A2'    // 选中框位置
                  }];



let rowNum = Number(worksheet.rowCount);  //获取行数
let cellNum = Number(worksheet.columnCount);  //获取列数
let cellType = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N'];

for(let i=1; i< rowNum+1; i++) {  // 所有行表格定义
  worksheet.getRow(i).alignment  = {  // 对齐方式
    vertical: 'middle',
    horizontal: 'center'
  }
  if (i == 1) {
    worksheet.getRow(i).font = {  // 首行字体
      size: 9,
      bold:true
    }
  }
  if (i > 1) {
    worksheet.getRow(i).font = {  // 除首行字体其他所有字体设置
      size: 10
    }
  }
}

for (let j=0; j < cellNum; j++) {  // 每个单元格
  for (let x =0; x<rowNum; x++){
    if (x == 0) {     // 设置第一行有值的背景色
      worksheet.getCell(cellType[j] + (x+1)).fill = {  // 填充
        type: 'pattern',
        pattern:'solid',
        fgColor:{argb:'FFF3F3F4'},
        bgColor:{argb:'FFFF0000'},
      };
    }
    if (x > 0) {  //设置除第一行，每一个单元格的边框
      worksheet.getCell(cellType[j] + (x+1)).border = {
        top: {style:'thin'},
        left: {style:'thin'},
        bottom: {style:'thin'},
        right: {style:'thin'}
      };
    }
  }
  if (j == (cellNum-1)) {  // 设置第一行最后一个单元格又边框
    worksheet.getCell(cellType[j] + "1").border = {
      right: {style:'thin'}
    };
  }
}

// save workbook to disk
workbook.xlsx.writeFile("first.xlsx").then(function() {
  console.log("saved");
});
