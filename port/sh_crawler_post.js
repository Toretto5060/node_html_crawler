const app = require('../app');
app.server.post("/court/sh",(req,res)=>{
  /***
   * 起始时间：startDate
   * 结束时间：endDate
   * 被告：defendant
   * 原告：plaintiff
   * 审判长：presiding_judge
   * 案由：case_action
   * **/
  app.handleMySql('sh_grabOpenCourt',(db) => {

    db.query(
      'select * from courtData where defendant like "%?%" and plaintiff like "%?%" and presiding_judge like "%?%" and cause_action like "%?%"',
      [
        req.body.defendant,
        req.body.plaintiff,
        req.body.presiding_judge,
        req.body.cause_action,
      ], (error, rows) => {
        if (!error) {
          console.log(rows)
          res.status(200).send({
            code:0,
            msg:"查询成功"
          })
        }
      }
    )
  })
})
