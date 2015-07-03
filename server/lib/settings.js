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
