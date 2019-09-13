const app = require('../app');
const dataList = require('./variableList');

app.server.get('/obtain/state',(req,res)=>{
  res.status(200).send({
    code:0,
    data:dataList,
    msg:"查询成功"
  })
})