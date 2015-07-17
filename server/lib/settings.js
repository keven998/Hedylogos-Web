// dependencies: lib/etcd_util.js

var mongoUrlHedy = getHedyMongoUrl();
var hedy = new MongoInternals.RemoteCollectionDriver(mongoUrlHedy);
Message = new Mongo.Collection("Message", { _driver: hedy});

function getHedyMongoUrl () {
  // 解析出相关参数
  var mongoUrl = Etcd.getSettingValue(Etcd.settingPath.mongo.url.path, Etcd_Result);
  var mongoUser = Etcd.getSettingValue(Etcd.settingPath.mongo.auth.user, Etcd_Result);
  var mongoPassword = Etcd.getSettingValue(Etcd.settingPath.mongo.auth.password, Etcd_Result);
  var mongoDb = Etcd.getSettingValue(Etcd.settingPath.mongo.auth.db, Etcd_Result);

  return 'mongodb://' + mongoUser + ':' + mongoPassword + '@' + mongoUrl.toString() + '/' + mongoDb;
}

var mongoUrlYunkai = 'mongodb://hedy-web:Jad4Ich3Up4J@192.168.100.2:32001/yunkai-dev';
var yunkai = new MongoInternals.RemoteCollectionDriver(mongoUrlYunkai);
ContactRequest = new Mongo.Collection("ContactRequest", { _driver: yunkai});

//TODO 发布
//TODO 订阅
//TODO 展示
//TODO 通过thrift接口接收请求
//TODO 用etcd获取mongo的连接方式
//TODO 修改hedy数据库的账号！
