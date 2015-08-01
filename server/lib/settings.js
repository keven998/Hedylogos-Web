// dependencies: lib/etcd_util.js

// var mongoUrlHedy = getMongoUrl(Etcd.settingPath.mongo['hedy-dev'].auth, Etcd.settingPath.mongo['mongo-dev'].url.path);
var mongoUrlHedy = getMongoUrl(Etcd.settingPath.mongo['hedy'].auth, Etcd.settingPath.mongo['mongo'].url.path);
hedy = new MongoInternals.RemoteCollectionDriver(mongoUrlHedy);
Message = new Mongo.Collection("Message", { _driver: hedy});

var mongoUrlYunkai = getMongoUrl(Etcd.settingPath.mongo['yunkai-dev'].auth, Etcd.settingPath.mongo['mongo-dev'].url.path);
console.log(mongoUrlYunkai);
// yunkai都是用测试库
// var mongoUrlYunkai = getMongoUrl(Etcd.settingPath.mongo['yunkai'].auth, Etcd.settingPath.mongo['mongo'].url.path);
yunkai = new MongoInternals.RemoteCollectionDriver(mongoUrlYunkai);
ContactRequest = new Mongo.Collection("ContactRequest", { _driver: yunkai});

function getMongoUrl (settings, mongoPath) {
  // 解析出相关参数
  var mongoUrl = Etcd.getSettingValue(mongoPath, Etcd_Data);
  var mongoDb = Etcd.getSettingValue(settings.db, Etcd_Data);

  if (settings.user && settings.password) {
    var mongoUser = Etcd.getSettingValue(settings.user, Etcd_Data);
    var mongoPassword = Etcd.getSettingValue(settings.password, Etcd_Data);

    return 'mongodb://' + mongoUser + ':' + mongoPassword + '@' + mongoUrl.toString() + '/' + mongoDb;
  }

  return  'mongodb://' + mongoUrl.toString() + '/' + mongoDb;
}


UserConversation = new Mongo.Collection('UserConversation');