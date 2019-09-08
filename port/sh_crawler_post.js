const app = require('../app');


function formatDate(now) { 
  let Datas = new Date(parseInt(now))
  let year=Datas.getFullYear(); 
  let month=Datas.getMonth()+1> 9 ?Datas.getMonth()+1 : "0" + Datas.getMonth()+1; 
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

app.server.post("/court/sh",(req,res)=>{
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
    let sql = 'select * from courtData where trial_date between ? and ? and court like ? and presiding_judge like ? and plaintiff like ? and defendant like ? and case_num like ?'
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
          res.status(200).send({
            code:0,
            letght:rows.length,
            data:rows,
            msg:"查询成功"
          })
        } else {
          console.log(error)
        }
    })
  })
})
