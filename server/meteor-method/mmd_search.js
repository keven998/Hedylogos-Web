
Meteor.methods({
  // 获取所有poi
  'searchAllPoi': function (text) {
    check(text, String);
    var keyword = encodeURIComponent(text);
    var url = api.host + 'search?keyword=' + keyword + '&vs=true&restaurant=true&shopping=true&loc=true&pageSize=5';//&hotel暂时没有
    var result = HTTP.call('GET', url);

    if (!result || result.statusCode !== 200 || result.data.code !== 0){
      console.log('Failed in searching ' + text + ' from server!');
      return ;
    }
    return result.data.result;
  },

  // 获取单类Poi
  'searchSinglePoi': function (text, poiType) {
    check(text, String);
    check(poiType, String);
    var keyword = encodeURIComponent(text);
    var url = api.host + 'search?keyword=' + keyword + '&' + poiType + '=true&pageSize=99';
    var result = HTTP.call('GET', url);

    if (!result || result.statusCode !== 200 || result.data.code !== 0){
      console.log('Failed in searching ' + text + ' from server!');
      return ;
    }
    return result.data.result;
  }
});
