/**
 * 获取格式化的时间,当前格式为YYYYMMDDhhmmssms
 * @param  {[string]} ts      时间戳
 * @param  {[number]} pattern 日期格式
 * @return {[string]}         [description]
 */
getFormatTime = function(ts, pattern){
  var tempDate = ((ts) ? new Date(ts) : new Date());
  var Y = getFormatTimeUnit(tempDate.getFullYear(), 4);    //获取完整的年份(4位,1970-????)
  var M = getFormatTimeUnit(tempDate.getMonth() + 1, 2);       //获取当前月份(0-11,0代表1月)
  var D = getFormatTimeUnit(tempDate.getDate(), 2);        //获取当前日(1-31)
  var h = getFormatTimeUnit(tempDate.getHours(), 2);       //获取当前小时数(0-23)
  var m = getFormatTimeUnit(tempDate.getMinutes(), 2);     //获取当前分钟数(0-59)
  var s = getFormatTimeUnit(tempDate.getSeconds(), 2);     //获取当前秒数(0-59)
  var ms = getFormatTimeUnit(tempDate.getMilliseconds(), 3);    //获取当前毫秒数(0-999)
  switch (pattern){
    case 0:
      return Y + M + D + h + m + s + ms;
    case 1:
      return Y + '-' + M + '-' + D + ' ' + h + ':' + m + ':' + s;
    default:
      return Y + M + D + h + m + s + ms;
  }
}

/**
 * 获得格式化(定长)的时间单元(年，月，日，时，分，秒)
 * @param  {[number]} timeUnit 原时间单元数值
 * @param  {[number]} l        长度
 * @return {[string]}          格式化的时间单元字符串
 */
getFormatTimeUnit = function(timeUnit, l){
  var temp = (timeUnit) ? timeUnit + '' : '';
  for (var i = 1;i < l;i++){
    temp = parseInt(temp / 10);
    if (!temp)
      timeUnit = '0' + timeUnit;
  }
  return timeUnit;
}

