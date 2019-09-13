const app = require('../app');
const dataList = require('../module/variableList');

app.server.get('/obtain/state',(req,res)=>{
  res.status(200).send({
    code:0,
    data:dataList.sh_port,
    msg:"查询成功"
  })
})