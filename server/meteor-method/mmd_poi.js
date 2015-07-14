Meteor.methods({
  // 获取poi详情
  'getPoiDetail': function (id, type) {
    check(id, String);
    check(type, String);
    if (type == 'loc'){
      var url = api.host + 'geo/' + 'localities' + '/' + id;
    } else {
      var url = api.host + 'poi/' + type + '/' + id;
    }

    var result = HTTP.call('GET', url);
    if (!result || result.statusCode !== 200 || result.data.code !== 0){
      console.log('Failed in requesting ' + type + 'detail from server!');
      return ;
    }
    return result.data.result;
  }
});
