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
  { header: '原告/上诉人', key: '3'}
];

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


worksheet.getRow(1).fill = {  // 填充
  type: 'pattern',
  pattern:'solid',
  fgColor:{argb:'FFF3F3F4'},
  bgColor:{argb:'FFFF0000'},
};

worksheet.getRow(1).alignment  = {  // 对齐方式
  vertical: 'middle',
  horizontal: 'center'
}

worksheet.getRow(1).font = {  // 字体
  size: 9,
  bold:true
}


// save workbook to disk
workbook.xlsx.writeFile("first.xlsx").then(function() {
  console.log("saved");
});
