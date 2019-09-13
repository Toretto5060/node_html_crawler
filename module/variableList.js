let sh_port = {}
sh_port.sh_grab_uppdate = false
sh_port.post_sh_gy = false

function getNowFormatDate() {//获取当前时间
	var date = new Date();
	var seperator1 = "-";
	var seperator2 = ":";
	var month = date.getMonth() + 1<10? "0"+(date.getMonth() + 1):date.getMonth() + 1;
	var strDate = date.getDate()<10? "0" + date.getDate():date.getDate();
	var currentdate = date.getFullYear() + seperator1  + month  + seperator1  + strDate
			+ " "  + (date.getHours() < 10 ? "0" + date.getHours() : date.getHours())  + seperator2  + (date.getMinutes()<10?"0"+date.getMinutes():date.getMinutes())
			+ seperator2 + (date.getSeconds()<10?"0"+date.getSeconds():date.getSeconds());
	return currentdate;
}

module.exports = {
  sh_port,
  getNowFormatDate
};