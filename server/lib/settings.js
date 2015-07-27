// dependencies: lib/etcd_util.js

var mongoUrlHedy = getMongoUrl(Etcd.settingPath.mongo.hedy.auth);
hedy = new MongoInternals.RemoteCollectionDriver(mongoUrlHedy);
Message = new Mongo.Collection("Message", { _driver: hedy});

var mongoUrlYunkai = getMongoUrl(Etcd.settingPath.mongo.yunkai.auth);
yunkai = new MongoInternals.RemoteCollectionDriver(mongoUrlYunkai);
ContactRequest = new Mongo.Collection("ContactRequest", { _driver: yunkai});

function getMongoUrl (settings) {
  // 解析出相关参数
  var mongoUrl = Etcd.getSettingValue(Etcd.settingPath.mongo.url.path, Etcd_Data);
  var mongoUser = Etcd.getSettingValue(settings.user, Etcd_Data);
  var mongoPassword = Etcd.getSettingValue(settings.password, Etcd_Data);
  var mongoDb = Etcd.getSettingValue(settings.db, Etcd_Data);

  return 'mongodb://' + mongoUser + ':' + mongoPassword + '@' + mongoUrl.toString() + '/' + mongoDb;
}


UserConversation = new Mongo.Collection('UserConversation');