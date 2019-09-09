const app = require('../app');


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
    let sql = 'select * from courtData where trial_date between ? and ? and court like ? and presiding_judge like ? ' +
      'and plaintiff like ? and defendant like ? and case_num like ?' //  limit 15
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
          let newObj = {}
          let newArr = []
          for (let i=0; i<postArr.length; i++) {
            if (postArr[i].trial_date) {
              postArr[i].trial_date = formatDate(postArr[i].trial_date)
            }
            for (let j=0; j < postList.length; j++) {
              newObj[postList[j]] = postArr[i][postList[j]]
            }
            newArr.push(newObj)
          }
          res.status(200).send({
            code:0,
            letght:newArr.length,
            data:newArr,
            msg:"查询成功"
          })
        } else {
          console.log(error)
        }
    })
  })
})
