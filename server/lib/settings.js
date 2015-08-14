// dependencies: lib/etcd_util.js

// var mongoUrlHedy = getMongoUrl(Etcd.settingPath.mongo['hedy-dev'].auth, Etcd.settingPath.mongo['mongo-dev'].url.path);
var mongoUrlHedy = getMongoUrl(Etcd.settingPath['project-conf'].mongo['hedy'].auth, Etcd.settingPath['backends']['mongo'].url.path);
hedy = new MongoInternals.RemoteCollectionDriver(mongoUrlHedy);
Message = new Mongo.Collection("Message", { _driver: hedy});

// var mongoUrlYunkai = getMongoUrl(Etcd.settingPath['project-conf'].mongo['yunkai-dev'].auth, Etcd.settingPath['backends']['mongo-dev'].url.path);
var mongoUrlYunkai = getMongoUrl(Etcd.settingPath['project-conf'].mongo['yunkai'].auth, Etcd.settingPath['backends']['mongo'].url.path);
yunkai = new MongoInternals.RemoteCollectionDriver(mongoUrlYunkai);
ContactRequest = new Mongo.Collection("ContactRequest", { _driver: yunkai});


function getMongoUrl (settings, mongoPath) {
  // 解析出相关参数
  var mongoUrl = Etcd.getSettingValue(mongoPath, Etcd_Data['backends']);
  var mongoDb = Etcd.getSettingValue(settings.db, Etcd_Data['project-conf']);

  if (settings.user && settings.password) {
    var mongoUser = Etcd.getSettingValue(settings.user, Etcd_Data['project-conf']);
    var mongoPassword = Etcd.getSettingValue(settings.password, Etcd_Data['project-conf']);

    return 'mongodb://' + mongoUser + ':' + mongoPassword + '@' + mongoUrl.toString() + '/' + mongoDb;
  }

  return  'mongodb://' + mongoUrl.toString() + '/' + mongoDb;
}


UserConversation = new Mongo.Collection('UserConversation');